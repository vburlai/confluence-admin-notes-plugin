/*
 * Copyright (c) 2015 Vitaly Burlai <vitaly.burlai@gmail.com>
 */

/**
 * Tooltip showing notes
 *
 */
var AdminNotesTooltipView = {
    $: AJS.$,
    RIGHT_OFFSET: -30,
    elem: null,
    text: null,
    pluginkey: null,
    timer: null,
    DELAY: 300,
    init: function () {
        if (this.elem === null) {
            this.text = this.$('<pre class="text"></pre>');
            this.elem = this.$('<div id="confluence-admin-notes-tooltip"><div class="arrow-up"></div></div>');
            this.elem.append(this.text);
            this.elem.on('mouseenter', this.$.proxy(this.cancelHide, this));
            this.elem.on('mouseleave', this.$.proxy(this.hide, this));
            this.elem.appendTo('BODY');
        }
    },
    hide: function () {
        if (this.timer === null ) {
            this.timer = window.setTimeout(this.$.proxy(function () {
                this.timer = null;
                this.elem.hide();
            }, this), this.DELAY);
        }
    },
    cancelHide: function () {
        if (this.timer !==  null) {
            window.clearTimeout(this.timer);
            this.timer = null;
        }
    },
    show: function (el, pluginkey) {
        this.cancelHide();
        this.pluginkey = pluginkey;
        this.elem.css('top', el.offset().top + el.height()>>1 + 'px');
        this.elem.css('right', document.body.offsetWidth + this.RIGHT_OFFSET - el.offset().left - (el.width()>>1) + 'px');
        this.refresh();
        this.elem.show();
    },
    refresh: function () {
        this.text.text(AdminNotesCollection.getNotes(this.pluginkey));
    }
};

