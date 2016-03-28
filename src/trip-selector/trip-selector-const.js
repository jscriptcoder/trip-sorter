import {duration2Minutes} from '../utils/utils';

/**
 * This structure will help us sort trips by cheapest or fastest.
 * @readonly
 * @@enum {Function}
 * @example: let sortedTrips = TYPE_SORT[type_param](trips);
 */
export const TYPE_SORT = {
    cheapest(trips) {
        return trips.sort((trip1, trip2) => trip1.cost > trip2.cost );
    },
    fastest(trips) {
        return trips.sort((trip1, trip2) => duration2Minutes(trip1.duration) > duration2Minutes(trip2.duration));
    }
};

/**
 * Template for the item result (li element)
 * @readonly
 * @type String
 */
export const RESULT_ITEM_TMPL = `
    <li class="trip-item well">
        <div class="trip">
            %departure%
            <i class="glyphicon glyphicon-arrow-right"></i>
            %arrival%
        </div>
        <div class="price">%price%</div>
        <div class="details">%details%</div>
    </li>
`;

/**
 * Template for the item totals
 * @readonly
 * @type String
 */
export const TOTAL_ITEM_TMPL = `
    <li class="total-item well">
        <div>Total</div>
        <div class="duration">%duration%</div>
        <div class="cost">%cost%</div>
    </li>
`;