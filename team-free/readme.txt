=== Responsive Team Members Showcase, Team Grid, Team Slider, and Staff List - Smart Team (formerly WP Team) ===
Contributors: shapedplugin, shamimmiashuhagh, rubel_miah, khalilu
Tags: team, team members, team grid, team showcase, team slider
Requires at least: 6.6
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 4.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Show your team with blocks or shortcodes in Grid, Carousel, List, Isotope filter, and Org Chart layouts. Responsive, no code needed.

== Description ==

[youtube https://www.youtube.com/embed/videoseries?list=PLoUb-7uG-5jPvyBSiv3x5HNvGQ3hx08RU]

[__Live Demo__](https://getwpteam.com/wp-team-lite-version-demo/) | [__Documentation__](https://docs.getwpteam.com/guide/introduction) | [__Support__](https://shapedplugin.com/create-new-ticket/)

**Smart Team** is a WordPress team showcase plugin for creating and managing team member displays. Build team sections visually with the Smart Team Grid and Carousel blocks in the block editor, or use the classic shortcode generator with 5 layouts: Carousel, Grid, List, Isotope filter, and Organization Chart. The main purpose is to display team or staff members, but it can also be used for other content that requires an image and text.

Version 4.0 adds a new block editor experience, a redesigned admin dashboard with a setup wizard, Ready Patterns, an AI Team Builder that works with your own API key, Saved Templates for page builders, and Department and Designation taxonomies to organize your team.

= Why use Smart Team? =

Displaying your team members helps visitors connect with the people behind your organization. Smart Team allows you to create team member pages without coding knowledge. The plugin provides an intuitive interface for building team displays.


= Who is Smart Team perfect for? =

* **Business Owners & Startups** – Showcase your staff, departments, and leadership team.
* **Agencies & Freelancers** – Present your creative team or collaborators.
* **Educational Institutions** – Display teachers, professors, faculty, or students.
* **Medical & Corporate Websites** – Highlight doctors, lawyers, executives, and professionals.
* **Non-profits & Organizations** – Introduce volunteers, board members, or community leaders.
* **Event & Conference Websites** – Showcase speakers, mentors, or trainers.
* **Online Communities & Clubs** – Present members, admins, or contributors.

= Available Input Fields =

* Member name
* Designation (taxonomy)
* Department (taxonomy)
* Photo/Image
* Short bio
* Full description
* Social links (Facebook, X, LinkedIn...)
* Skills with percentage bars (up to 3 per member)

>You can show/hide and customize every field.


= Available Layouts =

**Blocks (block editor)**

* Grid
* Carousel

**Shortcode generator**

* Carousel
* Grid
* List
* Isotope filter
* Organization Chart


= Block Editor Features =

* Smart Team Grid and Carousel blocks – build team sections visually, no shortcode needed.
* Member blocks: Name, Designation, Image, Bio, Description, Skills, and Social Profile.
* Ajax Pagination block for the Grid that loads more members without a page reload.
* Transform a Grid block into a Carousel block and back in one click.
* Ready Patterns library of pre-built team layouts; free patterns insert in one click, Pro patterns are marked.
* AI Team Builder – create a team layout from a prompt with your own OpenAI, Anthropic, Gemini, or Groq API key.
* Block template for the member single page, on block and classic themes.
* Saved Templates with the [sptp_saved_template] shortcode, to design once and reuse anywhere.

= Dashboard & Admin Features =

* Redesigned admin dashboard with Dashboard, Blocks, Modules, Saved Templates, Single Page, and Settings pages.
* Setup wizard that gets your first team showcase ready in minutes.
* Team Showcase Placements report – see every page, post, template, and widget area that shows a team.
* Turn each Smart Team block on or off from the Blocks page.
* Modules: White Label, Preloader, Member Social Profiles, Member Skills, and AI Team Builder – turn on only what you need.
* Department and Designation taxonomies to organize, group, and filter large teams.
* Export and import teams, members, departments, and designations (JSON).

= Key Features List =

* Fully responsive and mobile-ready.
* Create unlimited teams and members.
* 5 shortcode layouts (Carousel, Grid, List, Isotope filter, and Organization Chart).
* Shortcode Generator.
* Filter shortcode members by Department and Designation, with term relation and operator controls.
* Pagination for the Grid, List, and Isotope layouts.
* Member styles: Bottom, Top, Left, Right, and Caption, plus a Make it Card Style option.
* Skill bars on member cards and the single page.
* Multiple team shortcodes on one page.
* Settings panel - no coding required!
* Control columns in different devices.
* Control the total members to display.
* Display random order members.
* Margin or space between members.
* Member border, radius, and background color.
* Show/hide every element of a member.
* Social icon position, margin, and shapes.
* Choose the image size from the available crop sizes.
* Photo/Image border and background color.
* Image zoom in/out effect.
* Detail page link (on/off).
* Detail page fields control.
* Unlimited color & styling.
* Order & order by.
* 15 Team carousel slider options.
* Translation & RTL Ready.
* Multisite supported.
* Custom CSS options.
* Compatible with any theme.
* Page builder modules for Elementor, Divi (4 and 5), WPBakery, Beaver Builder, Oxygen and Bricks — each displays a Saved Template; switch each one on or off under Settings → Integrations.
* Opt-in diagnostic data sharing (see External services).

The Pro version of [__Smart Team__](https://getwpteam.com/) provides extra layouts, more styling controls, and extended customization options for building team member showcases with added flexibility.

= Documentation =

If you have any questions about working with Smart Team, you can take a look at the online [__documentation__](https://docs.getwpteam.com/guide/introduction).

= For Support and Bug Reporting =
If you encounter an issue or find any bugs, post it in the [support](https://shapedplugin.com/create-new-ticket/). You can also get support via [WordPress.org](https://wordpress.org/support/plugin/team-free/).

= Author =
Designed and Developed by [__ShapedPlugin, LLC__](https://shapedplugin.com/)

= Source Code =
The block editor scripts in `dist/editor/`, the admin dashboard script in `dist/dashboard/` and the Divi 5 module script in `dist/divi5/` are compiled. Their human-readable source is included in the plugin's `apps/` folder (`apps/blocks/`, `apps/dashboard/` and `apps/divi-5/`). To rebuild them, run `npm install` and `npm run install:divi5`, then `npm run build` from the plugin folder (uses `@wordpress/scripts`, plus webpack for the Divi 5 module; see `package.json` and `apps/divi-5/package.json`).

Third-party libraries bundled with the plugin: Swiper 12.2.0 (MIT, https://swiperjs.com) in `src/Frontend/js/swiper.min.js` with its source in `swiper.js`, and Isotope 3.0.6 (GPLv3, https://isotope.metafizzy.co) in `src/Frontend/js/isotope.pkgd.min.js` with its source in `isotope.pkgd.js`. Both load from the plugin folder; no CDN is used.

== External services ==

This plugin does not track visitors. Apart from the opt-in diagnostic data described below, it connects to the services below only when you use the related feature.

**Smart Team diagnostic data** (ShapedPlugin) – optional; sent only after an administrator agrees.
Nothing is sent unless an administrator agrees to it: by clicking Accept & Close on the admin notice, by finishing the setup wizard with the diagnostic data box ticked (it starts ticked; untick it to decline), or by turning on Smart Team → Settings → Advanced Controls → Contribute to Smart Team. After that, your site's server sends a report to ShapedPlugin's collector (api.shapedplugin.com) once when you agree and then once a week. The report contains the site administrator's email address and first and last name (as set on their profile), the site URL and language, the active theme's name, the WordPress, PHP, Smart Team and Smart Team database versions, the name and version of each active plugin, and the names of the Smart Team blocks the site uses. No team member content, post content or visitor data is sent, and nothing is sent from local or private-network sites. Turn Contribute to Smart Team off to stop it; deactivating or deleting the plugin also stops the weekly report.
Terms of service: https://shapedplugin.com/terms/ · Privacy policy: https://shapedplugin.com/privacy-policy/

**Smart Team Ready Patterns library** (ShapedPlugin) – lists and inserts pre-built team layouts in the block editor.
When you open the Patterns Library in the block editor, or when the AI Team Builder (see AI providers below) looks for a matching free pattern, your site's server requests the pattern list from ShapedPlugin's pattern server (demo.getwpteam.com/wp-json/wp-team-pro/v1/pattern-list, cached for 24 hours), and requests a pattern's block markup when you insert a free pattern. These requests send your site's URL and WordPress version (in the standard WordPress user agent) and, for an insert, the pattern ID; the server counts inserts per pattern to rank patterns by popularity. Your browser also loads the pattern thumbnails and live previews from the same server, which sends your IP address and browser information. No request is made until you open the library or generate with the AI Team Builder, and it can be turned off with the `sptp_ready_patterns_enabled` filter.
Terms of service: https://shapedplugin.com/terms/ · Privacy policy: https://shapedplugin.com/privacy-policy/

**Google Fonts** – loads web fonts chosen in a Smart Team block's typography settings.
When a page contains a block that uses a Google font, the visitor's browser requests the font stylesheet from fonts.googleapis.com (and font files from fonts.gstatic.com). This sends the visitor's IP address and browser information to Google. On the frontend, no request is made if no Google font is selected or when Google Fonts is turned off under Settings → Performance.
Terms of service: https://developers.google.com/terms · Privacy policy: https://policies.google.com/privacy

**Google Fonts Developer API** – lists the available fonts in the block editor.
When you open a Smart Team block's Typography settings in the block editor, your browser requests the list of available fonts from www.googleapis.com/webfonts/v1/webfonts. This sends your IP address, browser information and the plugin's API key to Google; no site content is sent. The editor also loads the selected font's stylesheet from fonts.googleapis.com to preview it.
Terms of service: https://developers.google.com/terms · Privacy policy: https://policies.google.com/privacy

**Pravatar** – sample member photos in the block editor.
When your site has no team members yet, the Grid and Carousel blocks preview with sample members so you can judge the card designs; your browser loads their photos from i.pravatar.cc, which sends your IP address and browser information. This happens only in the block editor and only while no member exists — never on the frontend.
Terms of service and privacy: https://pravatar.cc/

**AI providers: OpenAI, Anthropic, Google Gemini, Groq** – the AI Team Builder ("Build with AI" in the block editor).
Nothing is sent until an administrator adds their own API key for a provider under Smart Team → Settings → AI Configuration (or connects one in WordPress's own Settings → Connectors). Your site's server then contacts the provider: (1) to check a key against the provider's model list when it is saved, and again when an administrator opens AI Configuration and the last check is more than 12 hours old; (2) when a WordPress Connector is set up, to read that connector's available models when an administrator opens AI Configuration (cached for up to 12 hours); (3) when a user clicks Generate, sending your prompt, a description of the Grid/Carousel settings the AI may choose, the current values of those settings when refining an existing block, and the names, tags, use cases and short descriptions of matching free Ready Patterns. The API key travels in a request header. No team member content, post content or visitor data is sent. Keys are stored encrypted; administrators only ever see a masked form (first and last four characters), and the block editor never receives any part of a key. Nothing is sent when the module is turned off (Smart Team → Modules → Create Team with AI) or when the site has turned AI features off.
OpenAI (api.openai.com) – Terms of use: https://openai.com/policies/terms-of-use/ · Privacy policy: https://openai.com/policies/privacy-policy/
Anthropic (api.anthropic.com) – Terms of service: https://www.anthropic.com/legal/commercial-terms · Privacy policy: https://www.anthropic.com/legal/privacy
Google Gemini (generativelanguage.googleapis.com) – Terms of service: https://ai.google.dev/gemini-api/terms · Privacy policy: https://policies.google.com/privacy
Groq (api.groq.com) – Terms of service: https://groq.com/terms-of-use/ · Privacy policy: https://groq.com/privacy-policy/

**WordPress.org plugin directory** – shows ShapedPlugin's other free plugins on the Our Plugins tab of the plugin's admin dashboard.
When an administrator opens the Our Plugins tab, your site's server asks the WordPress.org plugin directory (api.wordpress.org) for the details of those plugins (cached for 24 hours), and your browser loads their icons from WordPress.org. This sends the standard WordPress request (your site's URL and WordPress version) and your IP address and browser information for the icons. Nothing is installed unless you click Install Now, which uses WordPress's own installer.

The version badge in the dashboard header also opens a changelog drawer. When an administrator opens it, your site's server requests this plugin's page data from api.wordpress.org (cached for 24 hours) to show the release notes. This sends the standard WordPress request (your site's URL and WordPress version).
Terms of service: https://wordpress.org/about/terms-of-service/ · Privacy policy: https://wordpress.org/about/privacy/

**YouTube** – shows the Getting Started tutorial video in the plugin's admin dashboard.
The Getting Started page (admin only) offers a YouTube tutorial video; the embedded player from youtube.com is loaded only after you click play, sending your IP address and browser information to YouTube.
Terms of service: https://www.youtube.com/t/terms · Privacy policy: https://policies.google.com/privacy



== Frequently Asked Questions ==

=Is Smart Team free?=
Yes! Smart Team is free.

=How can I showcase team members?=
After activating the plugin, you will see “Smart Team” in the WordPress admin dashboard. First, go to “Add New Member” and add as many members as you want. Then use either method below.

**With blocks:** open a page or post in the block editor, add the Smart Team Grid or Carousel block (or insert a Ready Pattern), and style it in the block sidebar.

**With the shortcode:** go to Manage Teams > Add New, customize the generator settings, and publish. Copy the generated shortcode and add it to any page or post, a widget area, or a template with a PHP function.

=Can I use Smart Team with my page builder?=
Yes. Save a team layout as a Saved Template, then add it with the Smart Team module in Elementor, Divi 4, Divi 5, WPBakery, Beaver Builder, Oxygen, or Bricks, or with the [sptp_saved_template] shortcode.

=Do I need an API key for the AI Team Builder?=
Yes. The AI Team Builder uses your own OpenAI, Anthropic, Google Gemini, or Groq API key (or a WordPress Connector), added under Smart Team > Settings > AI Configuration. Nothing is sent to an AI provider until you add a key.

= How can I access more features? =
A premium version with additional features is available. More information about [Smart Team Pro](https://getwpteam.com/) can be found on our website.


== Installation ==

= MINIMUM REQUIREMENTS =

* PHP 7.4 or later
* MySQL 5.6 or later
* WordPress 6.6 or later

**This section describes how to install the plugin and get it working**

= AUTOMATIC INSTALLATION (EASIEST WAY) =

To do an automatic install of Smart Team, log in to your WordPress dashboard, navigate to the Plugins menu, and click.
Add New.
In the search field, type "Smart Team" by ShapedPlugin. Once you have found it, you can install it by simply clicking.
"Install Now" and then "Activate".

= MANUAL INSTALLATION =

**Uploading in WordPress Dashboard**

* Download team-free.zip
* Navigate to the ‘Add New’ in the plugin's dashboard
* Navigate to the ‘Upload’ area
* Select team-free.zip from your computer
* Click ‘Install Now’
* Activate the plugin in the Plugin dashboard

**Using FTP**

* Download team-free.zip
* Extract the team-free directory to your computer
* Upload the team-free directory to the /wp-content/plugins/ directory
* Activate the plugin in the Plugin dashboard



== Screenshots ==

1. Carousel
2. Grid
3. List
4. Multicolumn List
5. All Members
6. Add New Member
7. All Shortcodes
8. General Settings
9. Member Styles
10. Control Member Info
11. Member Info Styles
12. Member Image Styles
13. Carousel Basics
14. Navigation
15. Pagination
16. Miscellaneous
17. Detail Page Settings
18. Typography
19. Export
20. Import
21. Single Page
22. Advanced
23. Additional CSS
24. Accessibility


== Changelog ==

= Version 4.0.0 – Nov 18, 2026 =
* New: Team Carousel block that shows your team in a sliding carousel, saving space while keeping every member visible.
* New: Team Grid block that displays your team in a clean, responsive grid, built visually in the block editor without shortcodes.
* New: Member Name, Designation, Image, Bio, Description, Skills, and Social Profile blocks, so you can place and style each part of a member card exactly where you want it.
* New: Ajax Pagination block for the Grid layout that loads more members without reloading the page, keeping large teams fast and easy to browse.
* New: Isotope filter layout for the shortcode, with filter buttons that let visitors filter members by department.
* New: Organization Chart (Org Chart) layout for the shortcode that shows your team hierarchy at a glance, built in a visual chart editor where you add child and sibling nodes and pick a member for each.
* New: Transform a Grid block into a Carousel block and back in one click, so you can try a different layout without rebuilding your team section.
* New: Ready Patterns library of pre-built team layouts in the block editor; free patterns give you a polished team section in one click, and Pro patterns are marked.
* New: AI Team Builder that creates a team layout from a simple prompt using your own OpenAI, Anthropic, Gemini, or Groq API key, so you can go from idea to finished design in seconds.
* New: Block template for the member single page, so you can design member profiles with the block editor, on block and classic themes.
* New: Saved Templates with the [sptp_saved_template] shortcode, so you can design a team layout once and reuse it anywhere on your site.
* New: Elementor, Divi 4, Divi 5, WPBakery, Beaver Builder, Oxygen, and Bricks modules that display a Saved Template, so you can add your team inside your favorite page builder.
* New: Redesigned admin dashboard with Dashboard, Blocks, Modules, Saved Templates, Single Page, Settings, Lite vs Pro, and Our Plugins pages, so everything you need is organized in one place.
* New: Setup wizard that walks you through the essentials, so your first team showcase is ready in minutes.
* New: Team Showcase Placements report that lists every page, post, template, and widget area showing a team, so you always know where your teams appear.
* New: Turn each Smart Team block on or off from the Blocks page, so the inserter shows only what you use.
* New: White Label, Preloader, Member Social Profiles, and Member Skills modules, so you can turn on only the features you need and keep your site lean.
* New: Department and Designation taxonomies for members, making it easy to organize, group, and filter large teams.
* New: Location, Language, and Gender taxonomies are previewed on the Add New Member screen as Pro features.
* New: Pagination for the shortcode's Grid, List, and Isotope layouts, so long teams split into pages.
* New: Filter shortcode members by Department and Designation, with term relation (AND / OR) and operator (IN, NOT IN, AND, EXISTS, NOT EXISTS) controls.
* New: Skills field for members, with skill bars on member cards and the single page, so you can highlight each person's expertise.
* New: Make it Card Style option that turns each shortcode member item into a card.
* New: Image Max Width option for the shortcode's List layout.
* New: Skill bar border radius option.
* New: Overlay Info Position option (Top, Middle, Bottom) for the Caption member style.
* New: Redesigned classic member single page with a cleaner, modular layout.
* New: Designations are now included in team export and import, alongside departments.
* New: Opt-in diagnostic data sharing that helps us improve the plugin, only if you choose to enable it.
* Improved: The Left, Right, and Caption member styles are now free for the shortcode.
* Improved: The member Position/Job Title field is replaced by the Designation taxonomy, and existing job titles move there automatically, so you upgrade without re-entering any data. The members list's Position column shows the designation.
* Improved: All settings moved to the new dashboard, and old settings links redirect there, so you never land on a missing page.
* Improved: Carousels keep their layout in older browsers and with CSS optimization plugins, so your team looks right for every visitor.
* Improved: The Create Team link on the Plugins screen now opens the block editor when available, so you can start building your team right away.
* Improved: Live Demo and Docs & Video Tutorials links on the Plugins screen, so you can explore examples and get help in one click.
* Fixed: A PHP warning no longer appears for members without social profiles.
* Fixed: Team import can no longer fetch images from local or private network addresses, keeping your site safer.
* Fixed: Security improvement – only users who can manage Smart Team can now create or edit members, teams, departments, and designations, protecting your team data from unauthorized changes.
* Fixed: Imported members no longer get an unrelated featured image when their photo can't be downloaded, so your team profiles stay accurate.
* Updated: Bundled Swiper library to version 12.2.0 for smoother, more reliable carousels.
* Tested: Compatible with WordPress 7.1.

= Version 3.0.15 – Aug 18, 2026 =
* Fixed: The Gutenberg block compatibility issue with WordPress 7.1 iframed editor.
* Fixed: Security improvement by adding capability checks to admin action handlers.
* Improved: Enhanced security for plugin activation, deactivation, and settings operations.
* Tested: WordPress 7.1 compatibility.

= Version 3.0.14 - Jul 01, 2026 =
* Improved: Use the plugins_api for recommended plugins section. 
* Improved: Enhanced unserialization security by disallowing classes. 

= Version 3.0.13 - Apr 10, 2026 =
* Fix: Some CSS style issues found with WordPress 7.0.
* Improved: The plugin security has been enhanced.
* Tested: WordPress 7.0 compatibility.

= Version 3.0.12 - Jan 12, 2026 =
* Improved: Standardized singleton instance property naming.
* Improved: Code readability and maintainability improved.

= Version 3.0.11 - Nov 17, 2025 =
* Tested: WordPress 6.9 compatibility.

= Version 3.0.10 - Aug 29, 2025 =
* Improved: Enhanced plugin security and data validation.
* Improved: Custom CSS and JS option.

= Version 3.0.9 - Aug 21, 2025 =
* New: Filter Members: Exclude option.
* New: The Carousel Navigation: Top-Left position.
* New: The Carouse Pagination: Dynamic option.
* Improved: Some plugin options are enhanced to make them more user-friendly.
* Improved: Plugin security.

= Version 3.0.8 - Jul 11, 2025 =
* Fix: Some WPCS-related warnings.
* Tested: WordPress 6.8.1 compatibility.

= Version 3.0.7 - Apr 16, 2025 =
* New: The Member Photo Shape (Rounded/Circle) option.
* Fix: The Member Padding option did not work in the carousel layout.
* Fix: The mismatched text domain issue.
* Fix: The translation-related warning was found with WP 6.8.
* Updated: The language (.pot) file.
* Tested: WordPress 6.8 compatibility.

= Version 3.0.6 - Feb 10, 2025 =
* Improved: The new Twitter icon has been added to the social media list.
* Fix: The 404 issue for the recommended plugin's logo URL.
* Updated: The language (.pot) file.
* Tested: WordPress 6.7.1 compatibility.

= Version 3.0.5 - Nov 21, 2024 =
* Fix: The plugin style issue for RTL sites.

= 3.0.4 - Nov 08, 2024 =
* Improved: The plugin backend options are enhanced.
* Improved: Remove unused code.
* Fix: There is an extra space issue when selecting a team in the gutenberg block.
* Fix: Some string translation issues.
* Updated: The language (.pot) file.
* Removed: The shortcode list query was removed from the page where the team was not used.
* Tested: WordPress 6.7 compatibility.

= 3.0.3 - Aug 23, 2024 =
* Fix: Some string translation issues.
* Updated: The language (.pot) file.
* Tested: WordPress 6.6.1 compatibility.

= 3.0.2 - Mar 27, 2024 =
* Fix: The warning was found when the plugin was activated via the WP-CLI command.
* Tested: WordPress 6.5 compatibility.

= 3.0.1 - Mar 20, 2024 =
* Fix: The Layout option dependency issue.

= 3.0.0 - Mar 11, 2024 =
* New: The Member Bio Display Type (Short/Full/Any) option.
* New: The Member Info Top Style option.
* New: The Member Padding option.
* New: The Box-Shadow of Member Card option.
* New: The Carousel Navigation and Pagination’s Hide in Mobile options.
* Improved: Plugin Backend and Frontend UI and UX have been improved and optimized hugely to make it more user-friendly.
* Improved: The 'Team Generator' menu is renamed to 'Manage Teams'.
* Improved: The Member Style options are reorganized with Visual Interaction.
* Improved: The Image Settings Tab has been moved inside the Display Settings Tab.
* Improved: The Options of Carousel Settings were reorganized by the Nested tab.
* Improved: The Team Section Title option moved to the Display Options tab.
* Improved: The Pagination options are moved to the bottom of the General Settings tab.
* Improved: The Grid/List/Carousel Style option moved after the Layout Preset option.
* Improved: The options on the plugin settings page are reorganized and optimized.
* Improved: The Options of Carousel Settings were reorganized by the Nested Tab.
* Improved: The Help Page has been redesigned to make it more user-friendly.
* Updated: The Language (.pot) file.
* Fix: Some strings were not translatable.
* Fix: Some WPCS-related warnings.
* Tested: WordPress 6.4.3 compatibility.

= 2.2.19 - Nov 07, 2023 =
* Fix: Few PHPCS warnings found with PHP8.2.
* Tested: WordPress 6.4 compatibility.

= 2.2.18 - Aug 08, 2023 =
* Fix: The team slider does not show along with Elementor Pro v3.14.0 or greater.
* Updated: Minimum required version of WordPress for the plugin.
* Tested: WordPress 6.3 compatibility.

= 2.2.17 - Jun 21, 2023 =
* Fix: The Custom CSS does not work on the single member page.
* Fix: The compatibility issue with WordPress v4.7
* Tested: WordPress 6.2.2 compatibility.

= 2.2.16 - May 23, 2023 =
* Improved: The import feature.
* Fix: The Gutenberg Block preview shows only the preloader sometimes.
* Fix: Social media links add the http protocol before the email.
* Fix: The Warnings found on the page if the used shortcode gets deleted.

= 2.2.15 - Mar 27, 2023 =
* New: A hook 'sptp_member_name_tag_for_single_member_page' to modify the member's name tag on the single member page as needed.
* Improved: Moved the section title margin bottom option to the Typography Settings
* Fix: The Elementor block icon gets modified by other plugin icons.

= 2.2.14 - Feb 14, 2023 =
* New: The Space between members option.
* New: Some important social icons have been added to the social media option.
* Fix: The grid layout has extra margin-left and margin-right.

= 2.2.13 - Feb 06, 2023 =
* Improved: The style of the single-member page.
* Improved: SVG preloading icon has been added as a preloader image.
* Fix: The deprecated warning of the single member page when the block theme is used.
* Fix: The alignment of social icons does not work in the list layout.

= 2.2.12 - Dec 21, 2022 =
* Fix: Some minor style issues for the RTL site
* Fix: The navigation style issue in the RTL site of the Elementor page.
* Fix: Some social icons do not show in preview mode.
* Improved: Plugin security improved.
* Removed: The section title default font-family to load the current theme style.
* Removed: The deprecated 'team-free' shortcode has been removed.
* Tested: WordPress 6.1.1 compatibility.

= 2.2.11 - Nov 16, 2022 =
* Improved: Load dynamic style according to the shortcode on the page.
* Fix: Dequeue Assets option does not work when the Elementor plugin is enabled.
* Tested: WordPress 6.1.1 compatibility.

= 2.2.10 - Oct 03, 2022 =
* Improved: The free mode feature of the carousel.
* Fix: Large image overlaps the text on the single-member page in the Twenty Twenty-Two theme.

= 2.2.9 - Aug 25, 2022 =
* Fix: Few deprecated JS warnings in the plugin settings page.

= 2.2.8 - Jul 16, 2022 =
* Fix: CSS conflict with Beaver Builder.

= 2.2.7 - Jun 15, 2022 =
* Fix: The premium page warnings.

= 2.2.6 - May 17, 2022 =
* Tested: WordPress 6.0 compatibility.
* Fix: The option of background color for the member image.
* Fix: Deprecated warning of the WP Team Gutenberg Block.
* Fix: Some backend assets don't load properly when the hosting directory is different.
* Updated: The Language (.pot) file.

= 2.2.5 - Apr 21, 2022 =
* Improved: The export-import functionality.
* Fix: Elementor addon deprecated warnings.

= 2.2.4 - Mar 10, 2022 =
* New: Filter hook 'sp_wp_team_ui_permission' added for User role permission.
* Fix: Compatibility issue for Gutenberg block with WP v4.9+ or earlier.
* Fix: WordPress 5.9 Gutenberg block compatibility issue.
* Fix: An undefined variable warning ($review) when Review Notice has been dismissed.
* Fix: The margin between bullet points of the carousel is large on the Elementor edit page.
* Fix: The member slug edit does not work on the team member page.
* Removed: The TinyMCE button of WP Team from the classic editor.

= 2.2.3 - Jan 26, 2022 =
* Tested: WordPress 5.9 compatibility.

= 2.2.2 - Jan 07, 2022 =
* New: Elementor addons added.

= 2.2.1 - Dec 09, 2021 =
* Fix: Error without team shortcode in Gutenberg block.

= 2.2.0 - Dec 08, 2021 =
* New: Gutenberg block.

= 2.1.8 - Nov 04, 2021 =
* Improved: Settings page "Save Changes" and "Reset Tab" button.
* Removed: "Reset All" button.

= 2.1.7 - Oct 14, 2021 =
* Improved: Backend settings.
* Fix: Several minor issues.

= 2.1.6 - Sep 06, 2021 =
* Improved: Plugin security.

= 2.1.5 - Aug 25, 2021 =
* New: Shortcode Live Preview option.
* Improved: Plugin codes.

= 2.1.4 - Aug 11, 2021 =
* New: Cache Enable/Disable button.
* New: Cache Delete button.

= 2.1.3 - Jul 08, 2021 =
* New: Free mode in team carousel.
* Fix: Member(s) per slide issue.
* Fix: Carouse item margin issue.
* Fix: Minor tweaking.

= 2.1.2 - Jun 10, 2021 =
* Fix: Missing method error.

= 2.1.1 - Jun 07, 2021 =
* New: Export and Import option.
* Fix: Order by date: ascending and descending do not work.
* Fix: Social icon spacing issue.
* Fix: Order by name doesn't work issue.
* Improved: The plugin core styles and scripts are conditionally loaded.
* Improved: A Few minor tweaks.
* Improved: Settings page border color.

= 2.1.0 - May 26, 2021 =
* New: Template overriding system
* New: Show/hide member single page fields in settings page.
* New: SEO-friendly single page slug.
* Update: Plugin framework and whole codebase.
* Update: Plugin language file.
* Improved: Color accessibility for disabled people.
* Improved: Backend Settings panel.

= 2.0.13 - Apr 22, 2021 =
* Fix: Source map error issue.

= 2.0.12 - Apr 19, 2021 =
* Fix: Premium page responsive issue.
* Fix: Help Tooltip position and styling issue.
* Improved: Dynamic version added in admin scripts & styles.

= 2.0.11 - Mar 18, 2021 =
* Fix: Shortcode field responsive issue.
* Improved: Settings page.
* Improved: Help page.
* Tested: WordPress 5.7 compatibility.

= 2.0.10 - Feb 18, 2021 =
* New: nofollow relation option for the detail page link.
* New: Shortcode copy onClick.
* Improved: Admin UI improved.

= 2.0.9 - Jan 08, 2021 =
* New: Mouse wheel scrolling for carousel.
* Improved: Admin setting improved.

= 2.0.8 - Dec 25, 2020 =
* New: Touch swipe option on carousel.
* New: Mouse drag option on carousel.
* Improved: Carousel scripts and styles.
* Fix: WordPress 5.6 compatible issue.

= 2.0.7 - Oct 13, 2020 =
* New: Member name got HTML support.
* Improved: Member image size option.

= 2.0.6 - Aug 18, 2020 =
* Fix: WordPress 5.5 compatible issue.

= 2.0.5 - Jun 08, 2020 =
* Fix: Word-break in short bio issue.

= 2.0.4 - Jan 24, 2020 =
* Fix: The Top Navigation appears from the bottom issue.
* Fix: Navigation border hover color issue.

= 2.0.3 - Jan 06, 2020 =
* Fix: Member border issue.
* Fix: Carouse autoplay issue.
* Fix: Member single page view issue.
* Fix: Section title margin issue.
* Fix: Margin between members issue on list view.
* Fix: Image zoom-in effects issue.
* Fix: Border radius issue.

= 2.0.2 - Sep 27, 2019 =
* Fix: Class and Function naming conflict issue.

= 2.0.1 - Aug 30, 2019 =
* Fix: Plugins page overlay issue.
* Fix: Pro version activation error issue.

= 2.0.0 - Aug 29, 2019 =
* Improved: Admin dashboard UI.
* New: 3 Unique layouts.
* New: Member border, radius, and background color.
* New: Show/hide every element of a member.
* New: Social icon position, margin, and shapes.
* New: Available cropping sizes.
* New: Photo/Image border and background color.
* New: Image zoom In/Out effect.
* New: Detail page link.
* New: Detail page fields control.
* New: 10+ Carousel control.
* New: Preloader.
* New: Page builders supported.
* New: RTL supported.
* New: WPML ready.
* New: Native WordPress widget.
* New: Multisite supported.
* New: Accessibility for disabled people.
* New: Custom CSS options.
* Fix: Other CSS tweaks.

= 1.0.5 =
* Fix: Fatal error issue.

= 1.0.4 =
* Fix: http & https mixed content issue.

= 1.0.3 =
* Preloader on team carousel.

= 1.0.2 =
* Backend text edited.

= 1.0.1 =
* Add shortcode generator.
* Add an infinite loop.
* Auto Play on / off
* Pagination on / off
* Navigation on / off

= 1.0 =
* First Release