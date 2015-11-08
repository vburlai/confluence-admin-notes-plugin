/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

(function($){
    // Integration with Universal Plugin Manager
    $(window).bind('upmready', function() {
        // Requires AJS.dialog2
        if (AJS && AJS.dialog2) {
            // Set Plugins context
            AdminNotesService.setPluginsContext();
            var ctx = AdminNotesService.getContext();
            
            // Init
            AdminNotesView.init(ctx);
            AdminNotesListView.init(ctx);
            AdminNotesTooltipView.init();
            AdminNotesManageListView.init(ctx);
            AdminNotesDialog.init(ctx);

            // Initial data fetch and starting timer for periodical updates
            AdminNotesCollection.init(ctx);
        }
    });

})(AJS.$);

