/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

/**
 * Saves data via AdminNotesService
 *
 * Uses the following format
 *    { title: "Plugin title", notes: "Plugin notes" }
 *
 * @type {{$: jQuery, plugins: Array, notes: {}, titles: {}, fetch: Function, save: Function}}
 */
var AdminNotesCollection = {
    $: AJS.$,
    // List of plugins with notes [ {key: '', title: ''} ]
    plugins: [],
    // Notes for the plugins { 'plugin key': 'notes' }
    notes: {},
    // Plugin titles { 'plugin key': 'title' }
    titles: {},
    // positions in plugins array
    pos: {},
    /**
     * Reads admin notes and updates AdminNotesListView
     */
    fetch: function () {
        AdminNotesService.getPlugins().done(
            this.$.proxy(
                function (data) {
                    this.plugins = [];
                    this.notes = {};
                    this.titles = {};
                    this.pos = {};
                    for (var key in data) {
                        if (data.hasOwnProperty(key)) {
                            var json = JSON.parse(data[key]);
                            this.pos[key] = this.plugins.length;
                            this.plugins[this.plugins.length] = { key: key, title: json['title'] || key };
                            this.notes[key] = json['notes'];
                            this.titles[key] = json['title'] || key;
                        }
                    }

                    $(document).trigger('admin-notes-collection-updated');
                    AdminNotesListView.setList(this.plugins);
                }, this)
        );
    },
    getTitle: function (key) {
        return this.titles[key];
    },
    getNotes: function (key) {
        return this.notes[key] || '';
    },
    getPlugins: function () {
        return this.plugins;
    },
    /**
     * Saves updated notes, use .add() for adding
     *
     * @returns the deferred object, .fail gets current notes
     */
    save: function (key, notes) {
        var res = $.Deferred();

        var prevVal = JSON.stringify({ title: this.titles[key], notes: this.notes[key] });
        var newVal = { title: this.titles[key], notes: notes };

        AdminNotesService.set(key, prevVal, JSON.stringify(newVal) ).done(
            this.$.proxy(
                function () {
                    this.notes[key] = newVal.notes;
                    res.resolve();
                }, this) ).fail(
            this.$.proxy(
                function (val) {
                    var json = JSON.parse(val);
                    this.titles[key] = json.title;
                    this.notes[key] = json.notes;
                    this.plugins[this.pos[key]].title = json.title;

                    $(document).trigger('admin-notes-collection-updated');

                    res.reject(json.notes);
                }, this) );

        return res;
    },
    /**
     * Add notes for new plugin
     *
     * @param key plugin key
     * @param title plugin title
     * @param notes plugin notes
     */
    add: function (key, title, notes) {
        var res = $.Deferred();

        var newVal = { title: title, notes: notes };
        AdminNotesService.set(key, '', JSON.stringify(newVal) ).done(
            this.$.proxy(
                function () {
                    this.titles[key] = newVal.title;
                    this.notes[key] = newVal.notes;
                    this.pos[key] = this.plugins.length;
                    this.plugins[this.pos[key]] = { key: key, title: newVal.title };

                    $(document).trigger('admin-notes-collection-updated');

                    AdminNotesListView.setList(this.plugins);
                    res.resolve();
                }, this) ).fail(
            this.$.proxy(
                function (val) {
                    var json = JSON.parse(val);
                    this.titles[key] = json.title;
                    this.notes[key] = json.notes;
                    this.plugins[this.pos[key]].title = json.title;

                    $(document).trigger('admin-notes-collection-updated');

                    res.reject(json.notes);
                }, this) );

        return res;
    }
};

