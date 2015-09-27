/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

/**
 * Tooltip showing notes
 *
 */
var AdminNotesTooltipView = {
    $: AJS.$,
    ARROW_RIGHT_OFFSET: 30,
    elem: null,
    text: null,
    pluginkey: null,
    init: function () {
        if (this.elem === null) {
            this.text = this.$('<pre class="text"></pre>');
            this.elem = this.$('<div id="confluence-admin-notes-tooltip"><div class="arrow-up"></div></div>');
            this.elem.append(this.text);
            this.elem.appendTo('BODY');
        }
    },
    hide: function () {
        this.elem.hide();
    },
    show: function (el, pluginkey) {
        this.pluginkey = pluginkey;
        this.elem.css('top', el.offset().top + el.height()>>1 + 'px');
        this.elem.css('right', document.body.offsetWidth - this.ARROW_RIGHT_OFFSET - el.offset().left - (el.width()>>1) + 'px');
        this.refresh();
        this.elem.show();
    },
    refresh: function () {
        this.text.text(AdminNotesCollection.getNotes(this.pluginkey));
    }
};

