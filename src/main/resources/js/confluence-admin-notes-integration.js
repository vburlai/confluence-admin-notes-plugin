/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

(function($){
    $(window).bind('upmready', function() {

        AdminNotesCollection.fetch();

        $(document).on('admin-notes-collection-updated', function () {
            AdminNotesView.init();
            AdminNotesListView.init();
            AdminNotesManagePluginsView.init();

            AdminNotesDialog.init();
        });
    });
})(AJS.$);

