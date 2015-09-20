/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

(function($){
    $(window).bind('upmready', function() {
        AdminNotesView.init();
        AdminNotesListView.init();

        AdminNotesCollection.fetch();

        AdminNotesDialog.init();
    });
})(AJS.$);

