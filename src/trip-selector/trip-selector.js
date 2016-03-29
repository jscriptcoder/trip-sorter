import './trip-selector.css!'; // trip-selector styles
import tripSelView from './trip-selector.html!text'; // trip-selector view HTML
import * as utils from '../utils/utils'; // some utilities
import {TYPE_SORT, RESULT_ITEM_TMPL, TOTAL_ITEM_TMPL} from './trip-selector-const';

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
     * @type HTMLElement
     * @private
     */
    result: HTMLElement;
    
    /**
     * Alert message
     * @type HTMLElement
     * @private
     */
    alert: HTMLElement;
    
    /**
     * Departures dropdown
     * @type HTMLUListElement
     * @private
     */
    from: HTMLUListElement;
    
    /**
     * Arrivals dropdown
     * @type HTMLUListElement
     * @private
     */
    to: HTMLUListElement;
    
    /**
     * Results list
     * @type HTMLUListElement
     * @private
     */
    trips: HTMLUListElement;
    
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
     * Button reset
     * @type HTMLButtonElement
     * @private
     */
    reset: HTMLButtonElement;
    
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
        
        // gets a hold of the DOM elements
        this.selector = this.el.querySelector('.selector');
        this.result = this.el.querySelector('.result');
        this.alert = this.el.querySelector('.alert');
        
        this.from = this.el.querySelector('.from ul');
        this.to = this.el.querySelector('.to ul');
        this.trips = this.el.querySelector('.result ul');
        
        this.cheapest = this.el.querySelector('.cheapest-btn');
        this.fastest = this.el.querySelector('.fastest-btn');
        
        this.search = this.el.querySelector('.search button');
        this.reset = this.el.querySelector('.reset button');

        this.initDropdowns();
        this.initEventListeners();
    }
    
    /**
     * Populates the dropdowns "from" and "to" with data from backend API
     * @private
     */
    initDropdowns() {
        
        // here you see the power of functional programming ;-)
        this.api.deals
            .map((deal) => deal.departure) // only departures
            .filter((deal, pos, arr) => arr.indexOf(deal) == pos) // removes duplicates
            .sort() // sorts asc
            .forEach((city) => this.from.appendChild(utils.string2Element(`<li data-value="${city}"><a href="#">${city}</a></li>`)));

        // we could simple reuse departure cities, but in case they are different from arrival cities
        this.api.deals
            .map((deal) => deal.arrival) // only arrivals
            .filter((deal, pos, arr) => arr.indexOf(deal) == pos) // removes duplicates
            .sort() // sorts asc
            .forEach((city) => this.to.appendChild(utils.string2Element(`<li data-value="${city}"><a href="#">${city}</a></li>`)));
     
        // TO-DO: use a documentFragment to optimize the insertion of LI elements without 
        // triggering new browser rendering
        
    }
    
    /**
     * Attaches event handlers to different controls
     * @private
     */
    initEventListeners() {
        this.from.addEventListener('click', this.onDropdownClick.bind(this));
        this.to.addEventListener('click', this.onDropdownClick.bind(this));
        this.search.addEventListener('click', this.onSearchClick.bind(this));
        this.reset.addEventListener('click', this.onResetClick.bind(this));
    }
    
    /**
     * Gets trigger when the user clicks on the list.
     * We do event delegation here.
     * @event
     * @private
     */
    onDropdownClick(event) {
        const target = event.target;
        
        // in case we click on the A element, we need the parent LI
        const item = target.nodeName === 'A' ? target.parentElement : target;
        
        if (item.nodeName === 'LI') {
            const menu = item.parentElement;
            const input = utils.findElementInParents(item, 'input');
            menu.dataset['selected'] = input.value = item.dataset['value']; 
        }
    }
    
    /**
     * Gets trigger when the user clicks on search button
     * @event
     * @param {MouseEvent} event
     * @private
     */
    onSearchClick(event) {
        event.stopPropagation();
        
        const departure = this.from.dataset['selected'];
        const arrival = this.to.dataset['selected'];
        const sortType = this.getSortType();
        let trips = [];

        if (departure && arrival) {

            console.log(`From ${departure} to ${arrival}`);
            
            if (departure !== arrival) {
                trips = this.api.deals.filter((deal) => deal.departure === departure && deal.arrival === arrival);

                if (trips && trips.length) {
                    TYPE_SORT[sortType](trips);
                    console.log(`Sorted by ${sortType}:`, trips);

                    this.showResult(trips);


                } else {
                    this.shotAlert(`Sorry, but we could not find trips from <strong>${departure}</strong> to <strong>${arrival}</strong>`, 'warning');
                }
            } else {
                this.shotAlert('Ooops!!, Departure and arrival are the same');
            }
            
        } else {
            this.shotAlert('Please, select both departure and arrival');
        }

    }
    
    /**
     * Gets trigger when the user clicks on reset button
     * @event
     * @private
     */
    onResetClick() {
        this.result.classList.add('hidden');
        this.selector.classList.remove('hidden');
        this.trips.innerHTML = '';
    }
    
    /**
     * Returns the sorting selected
     * @return {String} - "cheapest" | "fastest"
     * @public
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
        
        this.selector.classList.add('hidden');
        this.result.classList.remove('hidden');
        
        this.trips.innerHTML = '';
        
        // let's iterate over the results and build the DOM list
        for (let trip of trips) {
            
            const compiledItem = utils.compileTemplate(RESULT_ITEM_TMPL, {
                departure: trip.departure,
                arrival: trip.arrival,
                price: `${this.api.currency}${trip.cost}`,
                details: `${trip.transport} - ${trip.reference} for ${trip.duration.h}h${trip.duration.m}`
            });
            
            const item = utils.string2Element(compiledItem);
            
            // TO-DO: use a documentFragment to optimize the DOM manipulation
            this.trips.appendChild(item);
            
            // accumulators
            totalCost += trip.cost;
            totalMins += utils.duration2Minutes(trip.duration);
        }
        
        const totalDuration = utils.minutes2Duration(totalMins);
        const itemTotal = utils.string2Element(utils.compileTemplate(TOTAL_ITEM_TMPL, {
            duration: `${totalDuration.h}h${totalDuration.m}`,
            cost: `${this.api.currency}${totalCost}`
        }));
        
        this.trips.appendChild(itemTotal);

    }
    
    /**
     * Shows an alert message
     * @param {String} message
     * @param {String} [type='danger']
     * @private
     */
    shotAlert(message, type = 'danger') {
        this.alert.innerHTML = message;
        this.alert.classList.add(`alert-${type}`);
        this.alert.classList.add('show');
        
        const onDocumentClick = () => {
            this.hideAlert();
            document.removeEventListener('click', onDocumentClick);
        }
        
        // let's hide the message when clicking away
        document.addEventListener('click', onDocumentClick);
    }
    
    /**
     * Hides the alert
     * @private
     */
    hideAlert() {
        this.alert.innerHTML = '';
        this.alert.classList.remove('show');
        this.alert.className = 'alert';
    }
    
}
