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
    timer: null,
    REFRESH: 5000,
    /**
     * Reads admin notes and updates AdminNotesListView
     */
    fetch: function () {
        if (this.timer === null) {
            this.timer = window.setInterval(this.$.proxy(this.fetch, this), this.REFRESH);
        }
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
                }, this)
        );
    },
    getTitle: function (key) {
        return this.titles[key];
    },
    getNotes: function (key) {
        return this.notes[key] || '';
    },
    hasNotes: function (key) {
        return typeof this.notes[key] != 'undefined';
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
        var res = this.$.Deferred();

        var prevVal = JSON.stringify({ title: this.titles[key], notes: this.notes[key] });
        var newVal = { title: this.titles[key], notes: notes };

        AdminNotesService.set(key, prevVal, JSON.stringify(newVal) ).done(
            this.$.proxy(
                function () {
                    this.notes[key] = newVal.notes;

                    res.resolve();

                    $(document).trigger('admin-notes-collection-updated');
                }, this) ).fail(
            this.$.proxy(
                function (val) {
                    var json = JSON.parse(val);
                    this.titles[key] = json.title;
                    this.notes[key] = json.notes;
                    this.plugins[this.pos[key]].title = json.title;

                    res.reject(json.notes);

                    $(document).trigger('admin-notes-collection-updated');
                }, this) );

        return res;
    },
    /**
     * Add notes for new plugin
     *
     * @param key plugin key
     * @param title plugin title
     * @param notes plugin notes
     * @returns the deferred object, .fail gets current notes
     */
    add: function (key, title, notes) {
        var res = this.$.Deferred();

        var newVal = { title: title, notes: notes };
        AdminNotesService.set(key, '', JSON.stringify(newVal) ).done(
            this.$.proxy(
                function () {
                    this.titles[key] = newVal.title;
                    this.notes[key] = newVal.notes;
                    this.pos[key] = this.plugins.length;
                    this.plugins[this.pos[key]] = { key: key, title: newVal.title };

                    res.resolve();

                    $(document).trigger('admin-notes-collection-updated');
                }, this) ).fail(
            this.$.proxy(
                function (val) {
                    var json = JSON.parse(val);
                    this.titles[key] = json.title;
                    this.notes[key] = json.notes;
                    this.plugins[this.pos[key]].title = json.title;

                    res.reject(json.notes);

                    $(document).trigger('admin-notes-collection-updated');
                }, this) );

        return res;
    },
    /**
     * Remove notes for new plugin
     *
     * @param key plugin key
     * @returns the deferred object, .fail gets current notes
     */
    remove: function (key) {
        var res = this.$.Deferred();

        var prevVal = JSON.stringify({ title: this.titles[key], notes: this.notes[key] });
        AdminNotesService.remove(key, prevVal).done(
            this.$.proxy(function () {
                this.titles[key] = undefined;
                this.notes[key] = undefined;
                this.plugins.splice(this.pos[key], 1);
                this.pos[key] = undefined;

                res.resolve();

                $(document).trigger('admin-notes-collection-updated');
            }, this)
        ).fail(
            this.$.proxy(function (val) {
                var json = JSON.parse(val);
                this.titles[key] = json.title;
                this.notes[key] = json.notes;
                this.plugins[this.pos[key]].title = json.title;

                res.reject(json.notes);

                $(document).trigger('admin-notes-collection-updated');
            }, this)
        );

        return res;
    }
};

