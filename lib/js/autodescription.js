/**
 * This file holds The SEO Framework plugin's JS code.
 *
 * @author Sybre Waaijer https://cyberwire.nl/
 * @pluginURI https://wordpress.org/plugins/autodescription/
 *
 * @credits StudioPress (http://www.studiopress.com/) for some code.
 */

/**
 * The SEO Framework plugin
 * Copyright (C) 2015 Sybre Waaijer, CyberWire (https://cyberwire.nl/)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published
 * by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS
// @output_file_name autodescription.min.js
// @externs_url https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.js
// ==/ClosureCompiler==
// http://closure-compiler.appspot.com/home

/* global settingsChanged, autodescription, autodescriptionL10n, titleTagline, titleAdditions, blogDescription, siteTitle, saveAlert, confirmReset */

/* Advanced Optimizations don't work well with function tabToggle, nor with the title character length */

/**
 * Holds AutoDescription values in an object to avoid polluting global namespace.
 *
 * @since 2.2.4
 *
 * @constructor
 */
window[ 'autodescription' ] = {

	settingsChanged: false,

	titleTagline: autodescriptionL10n.titleTagline,

	titleAdditions: autodescriptionL10n.titleAdditions,

	blogDescription: autodescriptionL10n.blogDescription,

	siteTitle: autodescriptionL10n.siteTitle,

	saveAlert: autodescriptionL10n.saveAlert,

	confirmReset: autodescriptionL10n.confirmReset,

	/**
	 * Cached doctitle function.
	 *
	 * @since 2.3.3
	 *
	 * @function
	 *
	 * @returns {Object} The jQuery doctitle ID's
	 */
	docTitles: function() {
		'use strict';

		var $doctitles = jQuery( '#autodescription_title, #autodescription-meta-doctitle, #autodescription-meta\\[doctitle\\], #autodescription-site-settings\\[homepage_title\\]' );

		return $doctitles;
	},

	/**
	 * Helper function for confirming a user action.
	 *
	 * @since 2.2.4
	 *
	 * @function
	 *
	 * @param {String} text The text to display.
	 * @returns {Boolean}
	 */
	confirm: function( text ) {
		'use strict';

		return confirm( text );
	},

	/**
	 * Description length counter.
	 *
	 * @since 2.2.4
	 *
	 * @function
	 *
	 * @return string The counter information
	 */
	updateCharacterCountDescription: function( event ) {
		'use strict';

		var $this = jQuery( event.target ),
			$length = $this.val().length,
			$placeholder = $this.attr('placeholder').length;

		// Emptied input, get Description placeholder.
		if ( $length === 0 ) {
			//* Output length from placeholder.
			var $output = ( $placeholder ).toString();

			jQuery('#' + autodescription.escapeStr( event.target.id ) + '_chars').html( $output );
		} else {
			jQuery( '#' + autodescription.escapeStr( event.target.id ) + '_chars' ).html( jQuery( event.target ).val().length.toString() );
		}
	},

	/**
	 * Title length counter, with special characters
	 *
	 * @since 2.2.4
	 *
	 * @function
	 *
	 * @return string The counter information
	 */
	updateCharacterCountTitle: function( event ) {
		'use strict';

		var $this = jQuery( event.target ),
			$additions = autodescription.titleAdditions.length,
			$description = autodescription.blogDescription.length,
			$siteTitle = autodescription.siteTitle.length,
			$titleLength = $this.val().length,
			$placeholder = $this.attr('placeholder').length,
			$tagline = jQuery( '#autodescription-site-settings\\[homepage_title_tagline\\]' ).val(),
			$seplen = 3;

		// Tagline removed, remove additions and separator.
		if ( ! autodescription.titleTagline ) {
			$additions = 0;
			$seplen = 0;
		}

		// Emptied input, get Site title.
		if ( $titleLength === 0 ) {
			if ( $siteTitle !== 0 ) {
				$titleLength = $siteTitle;
			} else {
				//* Output length from placeholder.
				var $output = ( $placeholder ).toString();

				jQuery('#' + autodescription.escapeStr( event.target.id ) + '_chars').html( $output );
			}
		}

		// Length should be something now.
		if ( $titleLength !== 0 ) {

			if ( $additions !== 0 && typeof $tagline !== 'undefined' ) {
				var $tagLength = $tagline.length;

				// Replace $additions with $tagline is $tagline isn't empty.
				if ( $tagLength !== 0 ) {
					$additions = $tagLength;
				} else {
					$additions = $description;
				}
			}

			// Put it all together
			var $output = ( $titleLength + $seplen + $additions ).toString();

			jQuery('#' + autodescription.escapeStr( event.target.id ) + '_chars').html( $output );
		}
	},

	/**
	 * Escapes HTML strings
	 *
	 * @since 2.2.4
	 *
	 * @function
	 *
	 * @return {String} HTML to jQuery converted string
	 */
	escapeStr: function( str ) {
		'use strict';

		if ( str )
			return str.replace(/([\[\]\/])/g,'\\$1');

		return str;
	},

	/**
	 * Dynamic Title separator replacement in metabox
	 *
	 * @since 2.2.2
	 *
	 * @function
	 *
	 * @return {Boolean} separator has Changed
	 */
	separatorSwitch: function( event ) {
		'use strict';

		var $sep = jQuery( ".autodescription-sep-js" ),
			$val = jQuery( event.target ).val();

		if ( $val == 'pipe' ) {
			$sep.text( " | " );
		} else if ( $val == 'dash' ) {
			$sep.text( " - " );
		} else {
			$sep.html( " &" + $val + "; " );
		}
	},

	/**
	 * Dynamic Description separator replacement in metabox
	 *
	 * @since 2.3.4
	 *
	 * @function
	 */
	separatorSwitchDesc: function( event ) {
		'use strict';

		var $sep = jQuery( ".autodescription-descsep-js" ),
			$val = jQuery( event.target ).val();

		if ( $val == 'pipe' ) {
			$sep.text(" | ");
		} else if ( $val == 'dash' ) {
			$sep.text(" - ");
		} else {
			$sep.html(" &" + $val + "; ");
		}
	},

	/**
	 * Status bar description output on hover
	 *
	 * @since 2.1.9
	 *
	 * @function
	 *
	 * @return {String} The information balloon
	 */
	statusBarHover: function() {
		'use strict';

		var $wrap = jQuery( '.ad-bar-wrap' ),
			$wrapA = jQuery( '.ad-bar-wrap a' );

		$wrapA.mouseenter( function() {
			var $this = jQuery( this ),
				$thisDesc = $this.attr( 'data-desc' );

			if ( ( $thisDesc !== undefined ) && ( 0 === $this.find( 'div' ).length ) ) {
				$this.append( '<div class="explanation-desc">' + $thisDesc + '<div></div></div>' );

				var $thisHeight = $this.find( 'div.explanation-desc' ).height() + 36;

				$this.find( 'div.explanation-desc' ).css( 'top', ( $this.position().top - $thisHeight ) + 'px' );
			}
		}).mousemove( function( event ) {
			var mousex = event.pageX - $wrap.offset().left;
			jQuery( 'span.ad-seo .explanation-desc div' ).css({
				left: mousex - 10 // -10px is needed, but why?
			});
		}).mouseleave( function() {
			jQuery( this ).find( 'div.explanation-desc' ).remove();
		});

	},

	/**
	 * Remove Status bar desc if clicked outside (touch support)
	 *
	 * @since 2.1.9
	 *
	 * @function
	 */
	removeDesc: function( event ) {
		'use strict';

		var $this = jQuery( event.target ),
			$desc = jQuery('.ad-bar-wrap a');

		if ( ! $this.closest( $desc ).length )
			$desc.find( 'div.explanation-desc' ).remove();
	},

	/**
	 * Refines Styling for the navigation tabs on the settings pages
	 *
	 * @since 2.2.2
	 *
	 * Rewritten
	 * @since 2.2.4
	 *
	 * @function
	 */
	tabToggle: function( event ) {
		'use strict';

		jQuery( 'div.autodescription-metaboxes .nav-tab-wrapper :input' ).each( function() {
			var $this = jQuery( this ),
				$target	= jQuery( event.target ).attr('id');

			// The second 'this' should be invalid? But it works D:
			$this.next().toggleClass( 'nav-tab-active', this.checked );

			if ( typeof $target !== 'undefined' && $target.indexOf( "-tabs-js" ) === -1 ) {
				var $id = $target;

				// Toggle content for the tabs in SEO settings page with the desired ID.
				autodescription.tabContent( $id );
			}

		});
	},

	/**
	 * Sets page output based on clicked input
	 *
	 * @since 2.2.2
	 *
	 * Rewritten
	 * @since 2.2.4
	 *
	 * @function
	 */
	tabContent: function( id ) {
		'use strict';

		if ( typeof id != 'undefined' ) {
			var $tab_id = id,
				$slice = $tab_id.slice( 0, $tab_id.indexOf('-tab') ),
				$hide = jQuery( '.' + $slice + '-tab-content' ),
				$show = jQuery( "#" + $tab_id + '-box');

			$hide.css( 'display', 'none' );
			$show.css( 'display', 'block' );
		}
	},

	/**
	 * Toggle tagline within the Left/Right example for the HomePage Title
	 *
	 * @since 2.2.4
	 *
	 * @function
	 *
	 * @return {Boolean} Title tagline removal
	 */
	taglineToggle: function( event ) {
		'use strict';

		var $this = jQuery( event.target ),
			$tag = jQuery( '.custom-blogname-js' );

		if ( $this.is(':checked') ) {
			$tag.css( 'display', 'inline' );
			autodescription.titleTagline = true;
		} else {
			$tag.css( 'display', 'none' );
			autodescription.titleTagline = false;
		}

		return autodescription.docTitles().trigger( 'keyup', autodescription.updateCharacterCountTitle );
	},

	/**
	 * Toggle tagline within Description example for the Example Description
	 *
	 * @since 2.3.4
	 *
	 * @function
	 */
	taglineToggleDesc: function( event ) {
		'use strict';

		var $this = jQuery( event.target ),
			$tagDesc = jQuery( '.on-blogname-js' );

		if ( $this.is(':checked') ) {
			$tagDesc.css( 'display', 'inline' );
		} else {
			$tagDesc.css( 'display', 'none' );
		}
	},

	/**
	 * Toggle tagline within the Left/Right example for the HomePage Title or Description
	 *
	 * @since 2.2.7
	 *
	 * @function
	 */
	taglineToggleOnload: function( event ) {
		'use strict';

		var $tagbox = jQuery( '#title-tagline-toggle :input' ),
			$tag = jQuery( '.custom-blogname-js' ),
			$tagboxDesc = jQuery( '#description-onblogname-toggle :input' ),
			$tagDesc = jQuery( '.on-blogname-js' );

		if ( $tagbox.is(':checked') ) {
			$tag.css( 'display', 'inline' );
		} else {
			$tag.css( 'display', 'none' );
		}

		if ( $tagboxDesc.is(':checked' ) ) {
			$tagDesc.css( 'display', 'inline' );
		} else {
			$tagDesc.css( 'display', 'none' );
		}
	},

	/**
	 * Change Title based on input of the Custom Title
	 *
	 * @since 2.2.4
	 *
	 * @function
	 */
	titleProp: function( event ) {
		'use strict';

		var $val = jQuery( event.target ).val(),
			$title = jQuery( '.custom-title-js' );

		if ( $val.length === 0 ) {
			$title.text( autodescription.siteTitle );
		} else {
			$title.text( $val );
		}
	},

	/**
	 * Change Title based on input of the Custom Title
	 *
	 * @since 2.3.8
	 *
	 * @function
	 */
	taglineProp: function( event ) {
		'use strict';

		var $val = jQuery( event.target ).val(),
			$title = jQuery( '.custom-tagline-js' );

		if ( $val.length === 0 ) {
			$title.text( autodescription.blogDescription );
		} else {
			$title.text( $val );
		}

		// Notify tagline has changed.
		autodescription.docTitles().trigger( 'keyup', autodescription.updateCharacterCountTitle );
	},

	/**
	 * Have all form fields in Genesis metaboxes set a dirty flag when changed.
	 *
	 * @since 2.0.0
	 *
	 * @function
	 */
	attachUnsavedChangesListener: function() {
		'use strict';

		jQuery( 'div.autodescription-metaboxes :input, div#theseoframework-inpost-box .inside :input' ).not('.nav-tab-wrapper :input').change( function() {
			autodescription.registerChange();
		});

		jQuery( 'div.autodescription-metaboxes input[type=text], div.autodescription-metaboxes textarea, div#theseoframework-inpost-box .inside input[type=text], div#theseoframework-inpost-box .inside textarea' ).not('.nav-tab-wrapper :input').on( 'keyup', function() {
			autodescription.registerChange();
		});

		window.onbeforeunload = function(){
			if ( autodescription.settingsChanged ) {
				return autodescription.saveAlert;
			}
		};

		jQuery( 'div.autodescription-metaboxes input[type="submit"], div#publishing-action input[type="submit"]' ).click( function() {
			window.onbeforeunload = null;
		});
	},

	/**
	 * Set a flag, to indicate form fields have changed.
	 *
	 * @since 2.2.4
	 *
	 * @function
	 */
	registerChange: function() {
		'use strict';

		autodescription.settingsChanged = true;
	},

	/**
	 * Ask user to confirm that settings should now be reset.
	 *
	 * @since 2.2.4
	 *
	 * @function
	 *
	 * @return {Boolean} True if reset should occur, false if not.
	 */
	confirmedReset: function() {
		'use strict';

		return confirm( autodescription.confirmReset );
	},

	/**
	 * Initialises all aspects of the scripts.
	 *
	 * Generally ordered with stuff that inserts new elements into the DOM first,
	 * then stuff that triggers an event on existing DOM elements when ready,
	 * followed by stuff that triggers an event only on user interaction. This
	 * keeps any screen jumping from occuring later on.
	 *
	 * @since 2.2.4
	 *
	 * @function
	 */
	ready: function() {
		'use strict';

		// Move the page updates notices below the top-buttons
		jQuery( 'div.updated, div.error, div.notice-warning' ).insertAfter( 'p.top-buttons' );

		// Bind character counters
		jQuery( '#autodescription_description, #autodescription-meta\\[description\\], #autodescription-site-settings\\[homepage_description\\]' ).on( 'keyup', autodescription.updateCharacterCountDescription );

		autodescription.docTitles().on( 'keyup', autodescription.updateCharacterCountTitle );

		// Allow the title separator to be changed dynamically.
		jQuery( '#title-separator input' ).on( 'click', autodescription.separatorSwitch );
		// Allow description separator to be changed dynamically.
		jQuery( '#description-separator input' ).on( 'click', autodescription.separatorSwitchDesc );

		// Initialise form field changing flag.
		autodescription.attachUnsavedChangesListener();

		// Initialize the status bar hover balloon.
		autodescription.statusBarHover();

		// Initialize status bar removal hover for touch screens.
		jQuery( document.body ).on( 'touchstart MSPointerDown', autodescription.removeDesc );

		// Bind reset confirmation
		jQuery( '.autodescription-js-confirm-reset' ).on( 'click.autodescription.autodescription_confirm_reset', autodescription.confirmedReset );

		// Toggle Tabs in the SEO settings page.
		jQuery( '#social-tabs-js, #robots-tabs-js, #knowledge-tabs-js, #sitemaps-tabs-js' ).on( 'click', autodescription.tabToggle );

		// Toggle Title tagline aditions removal.
		jQuery( '#title-tagline-toggle :input' ).on( 'click', autodescription.taglineToggle );

		// Toggle Description additions removal.
		jQuery( '#description-onblogname-toggle :input' ).on( 'click', autodescription.taglineToggleDesc );

		// Check if the Title Tagline or Description Additions should be removed when page is loaded
		jQuery( document.body ).ready( autodescription.taglineToggleOnload );

		// Change Title Example prop on textual input change
		jQuery( '#autodescription-site-settings\\[homepage_title\\]' ).on( 'keyup', autodescription.titleProp );
		jQuery( '#autodescription-site-settings\\[homepage_title_tagline\\]' ).on( 'keyup', autodescription.taglineProp );

	}

};

jQuery( autodescription.ready );