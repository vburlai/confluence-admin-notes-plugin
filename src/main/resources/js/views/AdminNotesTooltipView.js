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
    key: null,
    timer: null,
    DELAY: 300,

    init: function () {
        if (this.elem === null) {
            this.text = this.$('<pre class="text"></pre>');
            this.elem = this.$('<div id="confluence-admin-notes-tooltip"><div class="arrow-up"></div></div>');
            this.elem.append(this.text);

            // Event handlers
            this.elem.on('mouseenter', this.$.proxy(this.cancelHide, this));
            this.elem.on('mouseleave', this.$.proxy(this.hide, this));

            this.elem.appendTo('BODY');

            // Listen to Collection updates
            this.$(document).on('admin-notes-collection-updated', this.$.proxy( this.collectionUpdated, this ));
        }
    },

    /**
     * Triggered when collection is updated
     */
    collectionUpdated: function () {
        if (this.key) {
            this.refresh();
        }
    },

    /**
     * Hides tooltip with some DELAY
     */
    hide: function () {
        if (this.timer === null ) {
            this.timer = window.setTimeout(this.$.proxy(function () {
                this.timer = null;
                this.key = null;
                this.elem.hide();
            }, this), this.DELAY);
        }
    },

    /**
     * Cancels hide, for example, when mouse is back to the tooltip again
     */
    cancelHide: function () {
        if (this.timer !==  null) {
            window.clearTimeout(this.timer);
            this.timer = null;
        }
    },

    /**
     * Shows the tooltip under the specified element
     *
     * @param el  element under which the tooltip is placed
     * @param key entry key to show corresponding notes
     */
    show: function (el, key) {
        this.cancelHide();

        this.key = key;

        // set position
        this.elem.css('top', el.offset().top + el.height()>>1 + 'px');
        this.elem.css('right', document.body.offsetWidth + this.RIGHT_OFFSET - el.offset().left - (el.width()>>1) + 'px');

        // set text
        this.refresh();

        this.elem.show();
    },

    /**
     * Updates notes text
     */
    refresh: function () {
        this.text.text(AdminNotesCollection.getNotes(this.key));
    }
};

