/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

(function($){
    $(window).bind('upmready', function() {
        // Requires AJS.dialog2
        if (AJS && AJS.dialog2) {
            // Init
            AdminNotesView.init();
            AdminNotesListView.init();
            AdminNotesTooltipView.init();
            AdminNotesManagePluginsView.init();
            AdminNotesDialog.init();

            // Fetches data and starts timer for periodical fetching
            AdminNotesCollection.fetch();
        }
    });
})(AJS.$);

