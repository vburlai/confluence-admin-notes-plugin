/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

(function($){
    $(function () {
        // Requires AJS.dialog2
        if (AJS && AJS.dialog2) {
            // Integration with Universal Plugin Manager
            $(window).bind('upmready', function() {
                // careful here not to break UPM
                try {
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
                } catch (e) {};
            });

            // Integration with User Macros
            if ( (window.location.pathname === AJS.contextPath() + '/admin/usermacros.action') &&
                AJS.$('#user-macros-admin').length ) {
                // Set Macros context
                AdminNotesService.setMacrosContext();
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
        }
    });
})(AJS.$);

