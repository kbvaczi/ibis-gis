import mapValues from 'lodash/mapValues';

import parseRSS from './rss';
import fetchData from './gis';

import formatGIS from './gis/_formatGIS';

// filter methods mapped to `ibis.get`
const items = {
  forecast: 'Forecast',
  windSpeed: 'Wind Speed Probabilities',
  bestTrack: 'Preliminary Best Track',
  windField: 'Wind Field',
  stormSurge: 'Probabilistic Storm Surge 5ft'
};

/**
 * Gets hurricane GIS data as geoJSON
 * @param {Object} options
 * @param {String}  [options.name] - Optionally get data for specific storm by name if it exists
 * @param {String} [options.basin=at] - Specify basin
 * @param {Boolean} [options.exampleData=false] - Used to get active storm data from example RSS feed
 */
class Ibis {
  constructor({ name, basin = 'at', exampleData = false } = {}) {
    this.name = name;
    this.basin = basin;
    this.example = exampleData;
  }

  init = (filterVal, all) => {
    return async () => {
      let shps = await parseRSS(this.basin, this.example);
      let name = this.name ? this.name.toLowerCase() : undefined;

      let data = fetchData(shps, filterVal, name);

      return all ? data : data[0];
    };
  };

  get = mapValues(items, m => this.init(m, false));
  getAll = mapValues(items, m => this.init(m, true));

  /**
   * Custom fetch when RSS doesn't have current URL
   */

  async fetch(url) {
    return await formatGIS({ link: url, pubDate: null })();
  }
}

module.exports = Ibis;
