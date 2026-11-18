; (function ($) {
	const hash = window.location.hash.replace('#', '');
	const $menu = $('#menu-posts-sptp_member ul');

	// URL hash → tab id, and tab id → the end of its submenu entry's link.
	const HASH_TO_TAB = {
		'recommended': 'recommended-tab',
		'lite-to-pro': 'lite-to-pro-tab',
		'about-us': 'about-us-tab',
	};
	const TAB_TO_SUBMENU = {
		'recommended-tab': '#recommended',
		'lite-to-pro-tab': '#lite-to-pro',
		'about-us-tab': 'page=team_help',
	};

	// Marks the submenu entry whose link ends in `suffix` as the current one.
	const setCurrent = (suffix) => {
		$menu.find('li').removeClass('current');
		$menu.find('li a[href$="' + suffix + '"]').first().parent().addClass('current');
	};

	const openTab = (tabId) => {
		$('.sp-team-help .spwpteam-header-nav-menu a[data-id="' + tabId + '"]').trigger('click');
	};

	// Help page tab menu script.
	$('.sp-team-help').on('click', '.spwpteam-header-nav-menu a', function () {
		const tabId = $(this).attr('data-id');
		// A link without a tab (Get Started → the dashboard) is a normal link.
		if (!tabId || $(this).hasClass('active')) {
			return;
		}

		$('.spwpteam-header-nav-menu a[data-id]').each((i, item) => {
			$(item).removeClass('active');
			$('#' + $(item).attr('data-id')).css('display', 'none');
		});
		$(this).addClass('active');
		$('#' + tabId).css('display', 'block');

		if (TAB_TO_SUBMENU[tabId]) {
			setCurrent(TAB_TO_SUBMENU[tabId]);
		}
	});

	$('#menu-posts-sptp_member').on('click', 'ul li a', (e) => {
		const element = e.target.closest('a');

		setTimeout(() => {
			const tabId = HASH_TO_TAB[window.location.hash.replace('#', '')];
			if (!tabId) {
				return;
			}
			$menu.find('li').removeClass('current');
			openTab(tabId);
			$(element).parent().addClass('current');
		}, 0);
	});

	// Landing on the page with a tab hash (a bookmark, or the Help page link).
	// An unknown hash — including the old `#get-start` — leaves Recommended open.
	if (HASH_TO_TAB[hash]) {
		openTab(HASH_TO_TAB[hash]);
		setCurrent(TAB_TO_SUBMENU[HASH_TO_TAB[hash]]);
	}

	$('body').on('click', '.install-now', function (e) {
		var _this = $(this);
		var _href = _this.attr('href');

		_this.addClass('updating-message').html('Installing...');

		$.get(_href, function () {
			location.reload();
		});

		e.preventDefault();
	});

})(jQuery);
