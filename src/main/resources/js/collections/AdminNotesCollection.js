/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

/**
 * Saves data via AdminNotesService
 *
 * Uses the following format
 *    { title: "Plugin title", notes: "Plugin notes" }
 *
 */
var AdminNotesCollection = {
    $: AJS.$,
    // List of plugins with notes [ {key: '', title: ''} ]
    plugins: [],
    // Notes for the plugins { 'plugin key': 'notes' }
    notes: {},
    // Plugin titles { 'plugin key': 'title' }
    titles: {},
    // positions in plugins array { 'plugin key': index }
    pos: {},
    timer: undefined,
    REFRESH: 5000,

    /** getters */
    getTitle: function (key) {
        return this.titles[key] || key;
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
     * Initial setup and fetching data
     */
    init: function () {
        if (typeof this.timer === "undefined") {
            this.timer = window.setInterval(this.$.proxy(this.fetch, this), this.REFRESH);
        }
        this.fetch();
    },
    fetch: function () {
        AdminNotesService.getPlugins().done(this.$.proxy( this.resetWithData, this ));
    },
    // @TODO Hide private methods
    /**
     * [Private] Re-init collection with received data
     */
    resetWithData: function (data) {
        this.plugins = [];
        this.notes = {};
        this.titles = {};
        this.pos = {};
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                try {
                    var json = JSON.parse(data[key]);
                    this.pos[key] = this.plugins.length;
                    this.plugins[this.plugins.length] = {key: key, title: json['title'] || key};
                    this.notes[key] = json['notes']; // can be undefined, .hasNotes will detect it
                    this.titles[key] = json['title'] || key;
                } catch (e) {}
            }
        }

        var $ = this.$;
        window.setTimeout(function () {
            $(document).trigger('admin-notes-collection-updated');
        }, 0);
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

        AdminNotesService.set(key, prevVal, JSON.stringify(newVal)
        ).done(
            this.$.proxy(this.updateSuccessHandler, this, res, key, newVal.title, newVal.notes)
        ).fail(
            this.$.proxy(this.updateFailureHandler, this, res, key)
        );

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
        AdminNotesService.set(key, '', JSON.stringify(newVal)
        ).done(
            this.$.proxy(this.updateSuccessHandler, this, res, key, newVal.title, newVal.notes)
        ).fail(
            this.$.proxy(this.updateFailureHandler, this, res, key)
        );

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
        AdminNotesService.remove(key, prevVal
        ).done(
            this.$.proxy(this.removeSuccessHandler, this, res, key)
        ).fail(
            this.$.proxy(this.updateFailureHandler, this, res, key)
        );

        return res;
    },
    /**
     * [Private] Reset existing entry with given data or add new entry to the list
     */
    resetEntryWithData: function (key, title, notes) {
        this.titles[key] = title;
        this.notes[key] = notes;
        if (this.pos[key]) {
            // existing key
            this.plugins[this.pos[key]].title = title;
        } else {
            // new key added
            this.pos[key] = this.plugins.length;
            this.plugins[this.pos[key]] = {key: key, title: title};
        }

        var $ = this.$;
        window.setTimeout(function () {
            $(document).trigger('admin-notes-collection-updated');
        }, 0);
    },
    /**
     * [Private] Remove entry with given key from the collection
     */
    removeEntry: function (key) {
        this.titles[key] = undefined;
        this.notes[key] = undefined;
        this.plugins.splice(this.pos[key], 1);
        this.pos[key] = undefined;

        var $ = this.$;
        window.setTimeout(function () {
            $(document).trigger('admin-notes-collection-updated');
        }, 0);
    },
    /**
     * [Private] Handles success of add/save
     */
    updateSuccessHandler: function (res, key, title, notes) {
        this.resetEntryWithData(key, title, notes);

        res.resolve();
    },
    /**
     * [Private] Handles success of remove
     */
    removeSuccessHandler: function (res, key) {
        this.removeEntry(key);

        res.resolve();
    },
    /**
     * [Private] Handles failure of add/save/delete
     */
    updateFailureHandler: function (res, key, val) {
        var currentNotes;
        try {
            var json = JSON.parse(val);

            this.resetEntryWithData(key, json.title, json.notes);
        } catch (e) {}

        res.reject(currentNotes);
    }
};

