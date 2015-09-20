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
        var self = this;
        AdminNotesService.getPlugins().done(
            function (data) {
                self.plugins = [];
                self.notes = {};
                self.titles = {};
                self.pos = {};
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        var json = JSON.parse(data[key]);
                        self.pos[key] = self.plugins.length;
                        self.plugins[self.plugins.length] = { key: key, title: json['title'] || key };
                        self.notes[key] = json['notes'];
                        self.titles[key] = json['title'] || key;
                    }
                }

                $(document).trigger('admin-notes-collection-updated');
                AdminNotesListView.setList(self.plugins);
            }
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
        var self = this;
        var res = $.Deferred();

        var prevVal = JSON.stringify({ title: this.titles[key], notes: this.notes[key] });
        var newVal = JSON.stringify({ title: this.titles[key], notes: notes });

        AdminNotesService.set(key, prevVal, newVal).done(function () {
                self.notes[key] = newVal.notes;
                res.resolve();
            }).fail(function (val) {
                var json = JSON.parse(val);
                self.titles[key] = json.title;
                self.notes[key] = json.notes;
                self.plugins[self.pos[key]].title = json.title;

                $(document).trigger('admin-notes-collection-updated');

                res.reject(json.notes);
            });

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

        var newVal = JSON.stringify({ title: title, notes: notes });
        AdminNotesService.set(key, '', newVal).done(function () {
                this.titles[key] = newVal.title;
                this.notes[key] = newVal.notes;
                this.pos[key] = this.plugins.length;
                this.plugins[this.pos[key]] = { key: key, title: newVal.title };

                $(document).trigger('admin-notes-collection-updated');

                AdminNotesListView.setList(this.plugins);
               res.resolve();
            }).fail(function (val) {
                var json = JSON.parse(val);
                this.titles[key] = json.title;
                this.notes[key] = json.notes;
                this.plugins[this.pos[key]].title = json.title;

                $(document).trigger('admin-notes-collection-updated');

                res.reject(json.notes);
            });

        return res;
    }
};

