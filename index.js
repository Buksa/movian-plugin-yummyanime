/* eslint-disable max-len */
/* eslint-disable no-var */
/**
 *  yummyanime plugin for Movian
 *
 *  Copyright (C) 2020
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
// ver 0.0.1

// Парсим plugin.json
var plugin = JSON.parse(Plugin.manifest);
var PREFIX = plugin.id;
var LOGO = Plugin.path + plugin.icon;
var page = require('movian/page');
var http = require('movian/http');

// Create the service (ie, icon on home screen)
require('movian/service').create(plugin.title, PREFIX + ':start', 'video', true, LOGO);

// Landing page
new page.Route(PREFIX + ':start', function(page) {
  page.loading = true;
  page.metadata.logo = LOGO;
  page.metadata.title = PREFIX;
  page.model.contents = 'grid';
  page.type = 'directory';
  page.entries = 0;
  var offset = 16, next = 0;


  resp = http.request('https://yummyanime.club/').toString();
  token = /"csrf-token" content="([^"]+)/gm.exec(resp)[1];

  function loader() {

  post = {
    debug: true,
    // caching: true, // Enables Movian's built-in HTTP cache
    // cacheTime: 6000,
    method: 'POST',
    headers: {
      'Accept': '*/*',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-csrf-token': token,
    },
    postdata: {
      skip: next,
      take: 16,
    },
  };

  var resp = http.request('https://yummyanime.club/load-more', post).toString();
  console.log({resp: resp});
  list = JSON.parse(resp);
  populateItemsFromList(page, list);
  next = next + offset;
  page.haveMore(true);//list.endOfData !== undefined && !list.endOfData);
}

loader();

page.loading = false;
page.asyncPaginator = loader;
});

function populateItemsFromList(page, list) {
  page.entries = 0;
  for (i = 0; i < list.length; i++) {
    page.appendItem(PREFIX + ':moviepage:' + JSON.stringify(list[i]), 'video', {
      title: list[i].name,
      description: list[i].description,
      icon: 'https://yummyanime.club/'+list[i].image,
    });
    page.entries++;
  }
}