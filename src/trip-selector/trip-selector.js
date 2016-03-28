import * as utils from '../utils/utils';
import tripSelView from './trip-selector.html!text'; // trip-selector view HTML

/**
 * This structure will help us sort trips by cheapest or fastest.
 * @readonly
 * @@enum {Function}
 * @example: let sortedTrips = TYPE_SORT[type_param](trips);
 */
const TYPE_SORT = {
    cheapest(trips) {
        return trips.sort((trip1, trip2) => trip1.cost > trip2.cost );
    },
    fastest(trips) {
        return trips.sort((trip1, trip2) => utils.duration2Minutes(trip1.duration) > utils.duration2Minutes(trip2.duration));
    }
};

/**
 * Template html for the item result (li element)
 * @type String
 */
const RESULT_ITEM_TMPL = `
    <li>
        <div class="trip">%departure% &gt; %arrival%</div>
        <div class="price">%price%</div>
        <div class="details">%details%</div>
    </li>
`;

/**
 * Trip Selector widget. Contains all the logic
 * @class TripSelector
 */
export default class TripSelector {
    
    /**
     * Widget element
     * @type HTMLElement
     * @private
     */
    el: HTMLElement;
    
    /**
     * Input view
     * @type HTMLElement
     * @private
     */
    selector: HTMLElement;
    
    /**
     * Result view
     * @type HTMLUListElement
     * @private
     */
    result: HTMLUListElement;
    
    /**
     * Departures dropdown
     * @type HTMLSelectElement
     * @private
     */
    from: HTMLSelectElement;
    
    /**
     * Arrivals dropdown
     * @type HTMLSelectElement
     * @private
     */
    to: HTMLSelectElement;
    
    /**
     * Radiobutton cheapest
     * @type HTMLInputElement
     * @private
     */
    cheapest: HTMLInputElement;
    
    /**
     * Radiobutton fastest
     * @type HTMLInputElement
     * @private
     */
    fastest: HTMLInputElement;
    
    /**
     * Button search
     * @type HTMLButtonElement
     * @private
     */
    search: HTMLButtonElement;
    
    /**
     * Backend response
     * @type Object
     * @private
     */
    api: Object;
    
    /**
     * @constructs
     * @param {HTMLElement} el - root element
     * @param {Object} api - backend response
     */
    constructor(el, api) {
        this.el = el;
        this.api = api;
        this.init();
    }
    
    /**
     * Initialises the widget
     * @param {String} [htmlView=tripSelView] - view of the widget (optional)
     * @private
     */
    init(htmlView = tripSelView) {
        this.el.innerHTML = htmlView;
        
        this.selector = this.el.querySelector('.selector');
        this.result = this.el.querySelector('.result');
        this.from = this.el.querySelector('.from-sel');
        this.to = this.el.querySelector('.to-sel');
        this.cheapest = this.el.querySelector('.cheapest-btn');
        this.fastest = this.el.querySelector('.fastest-btn');
        this.search = this.el.querySelector('.search-btn');

        this.initDropdowns();
        this.initEventListeners();
    }
    
    /**
     * Populates the dropdowns "from" and "to" with data from backend API
     * @private
     */
    initDropdowns() {
        
        // Here you see the power of functional programming ;-)
        this.api.deals
            .map((deal) => deal.departure) // only departures
            .filter((deal, pos, arr) => arr.indexOf(deal) == pos) // removes duplicates
            .sort() // sorts asc
            .forEach((city) => { this.from.appendChild(utils.string2Element(`<option value="${city}">${city}</option>`)) });

        // We could simple reuse departure cities, but in case they are different from arrival cities
        this.api.deals
            .map((deal) => deal.arrival) // only arrivals
            .filter((deal, pos, arr) => arr.indexOf(deal) == pos) // removes duplicates
            .sort() // sorts asc
            .forEach((city) => { this.to.appendChild(utils.string2Element(`<option value="${city}">${city}</option>`)) });
        
    }
    
    /**
     * Attaches event handlers to different controls
     * @private
     */
    initEventListeners() {
        this.search.addEventListener('click', this.onSearchClick.bind(this));
    }
    
    /**
     * Gets trigger when the user clicks on search button
     * @event
     * @private
     */
    onSearchClick() {
        const departure = this.from.value;
        const arrival = this.to.value;
        const sortType = this.getSortType();
        let trips = [];

        console.log(`From ${departure} to ${arrival}`);
        
        if (departure !== arrival) {
            trips = this.api.deals.filter((deal) => deal.departure === departure && deal.arrival === arrival);

            if (trips && trips.length) {
                TYPE_SORT[sortType](trips);
                console.log(`Sorted by ${sortType}:`, trips);

                this.showResult(trips);
                
                
            } else {
                // TO-DO: there aren't trips from this city to the other
            }
        } else {
            // TO-DO: departure is the same as arrival
        }
    }
    
    /**
     * Returns the sorting selected
     * @return {String} - "cheapest" | "fastest"
     */
    getSortType() {
        return this.cheapest.checked ? this.cheapest.value : this.fastest.value;
    }
    
    /**
     * Shows the result of a search
     * @param {Object[]} trips - list of sorted trips
     * @private
     */
    showResult(trips) {
        let totalCost = 0;
        let totalMins = 0;
        
        this.selector.style.display = 'none';
        this.result.innerHTML = '';
        
        for (let trip of trips) {
            
            let compiledItem = utils.compileTemplate(RESULT_ITEM_TMPL, {
                departure: trip.departure,
                arrival: trip.arrival,
                price: `${this.api.currency}${trip.cost}`,
                details: `${trip.transport} ${trip.reference} ${trip.duration.h}h${trip.duration.m}`
            });
            
            let item = utils.string2Element(compiledItem);
            
            this.result.appendChild(item);
            
            totalCost += trip.cost;
            totalMins += utils.duration2Minutes(trip.duration);
        }
        
        const totalDuration = utils.minutes2Duration(totalMins);
        const itemResult = utils.string2Element(`<li>Total ${totalDuration.h}h${totalDuration.m} ${this.api.currency}${totalCost}</li>`);
        this.result.appendChild(itemResult);

    }
    
}