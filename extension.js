// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
const Me = imports.misc.extensionUtils.getCurrentExtension();

const {Gio, GLib, GObject, Shell, St} = imports.gi;
const Constants = Me.imports.constants;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main
const PanelMenu = imports.ui.panelMenu
const PopupMenu = imports.ui.popupMenu
const Util = imports.misc.util

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

function _aboutThisDistro() {
	Util.spawn(['gnome-control-center', 'info-overview'])
}

function _terminal() {
	Util.spawn(['gnome-terminal'])
}

function _systemPreferences() {
	Util.spawn(['gnome-control-center'])
}

function _appStore() {
	Util.spawn(['gnome-software'])
}

function _missionControl() {
	Main.overview.toggle();
}

function _forceQuit() {
	var window_list = global.get_window_actors();
	var active_window_actor = window_list.find(window => window.meta_window.has_focus());
	var active_window = active_window_actor.get_meta_window()
	var pid = active_window.get_pid();
	
	Util.spawn(['kill', '-s', '9', pid.toString()])
}

function _sleep() {
	Util.spawn(['systemctl', 'suspend'])
}

function _restart() {
	Util.spawn(['gnome-session-quit', '--reboot'])
}

function _shutdown() {
	Util.spawn(['gnome-session-quit', '--power-off'])
}

function _lockScreen() {
	Util.spawn(['dbus-send', '--type=method_call', '--dest=org.gnome.ScreenSaver', '/org/gnome/ScreenSaver', 'org.gnome.ScreenSaver.Lock'])
}

function _logOut() {
	Util.spawn(['gnome-session-quit', '--logout'])
}

function _extensions() {
	Util.spawn(['gnome-extensions-app'])
}

function _middleClick(actor, event) {
	// left click === 1, middle click === 2, right click === 3
	if (event.get_button() === 2) {
		this.menu.close();
		Main.overview.toggle();
	}
}

// function _hover() {
// 	button.actor.remove_actor(icon)

// 	const icon_hover = new St.Icon({
// 		style_class: 'menu-button-hover'
// 	})
	
// 	button.actor.add_actor(icon_hover)
// }


var MenuButton = GObject.registerClass(class FedoraMenu_MenuButton extends PanelMenu.Button {
	_init() {
		super._init(0.0, "MenuButton");
		this._settings = ExtensionUtils.getSettings(Me.metadata['settings-schema']);

		// Icon
		this.icon = new St.Icon({
			style_class: 'menu-button'
		})
		this._settings.connect("changed::menu-button-icon-image", () => this.setIconImage())
		this._settings.connect("changed::menu-button-icon-size", () => this.setIconSize())
		this.setIconImage()
		this.setIconSize()
		this.add_actor(this.icon)

		// Menu
		this.item1 = new PopupMenu.PopupMenuItem(_('About My System'))
		this.item2 = new PopupMenu.PopupSeparatorMenuItem()
		this.item3 = new PopupMenu.PopupMenuItem(_('System Settings'))
		this.item4 = new PopupMenu.PopupMenuItem(_('Software Center'))
		this.item5 = new PopupMenu.PopupSeparatorMenuItem()
		this.item6 = new PopupMenu.PopupMenuItem(_('Activities'))
		this.item7 = new PopupMenu.PopupSeparatorMenuItem()
		this.item8 = new PopupMenu.PopupMenuItem(_('Force Quit App'))
		this.item9 = new PopupMenu.PopupSeparatorMenuItem()
		this.item10 = new PopupMenu.PopupMenuItem(_('Sleep'))
		this.item11 = new PopupMenu.PopupMenuItem(_('Restart...'))
		this.item12 = new PopupMenu.PopupMenuItem(_('Shut Down...'))
		this.item13 = new PopupMenu.PopupSeparatorMenuItem()
		this.item14 = new PopupMenu.PopupMenuItem(_('Lock Screen'))
		this.item15 = new PopupMenu.PopupMenuItem(_('Log Out'))

		this.item1.connect('activate', () => _aboutThisDistro())
		this.item3.connect('activate', () => _systemPreferences())
		this.item4.connect('activate', () => _appStore())
		this.item6.connect('activate', () => _missionControl())
		this.item8.connect('activate', () => _forceQuit())
		this.item10.connect('activate', () => _sleep())
		this.item11.connect('activate', () => _restart())
		this.item12.connect('activate', () => _shutdown())
		this.item14.connect('activate', () => _lockScreen())
		this.item15.connect('activate', () => _logOut())
		this.menu.addMenuItem(this.item1)
		this.menu.addMenuItem(this.item2)
		this.menu.addMenuItem(this.item3)
		this.menu.addMenuItem(this.item4)
		this.menu.addMenuItem(this.item5)
		this.menu.addMenuItem(this.item6)
		this.menu.addMenuItem(this.item7)
		this.menu.addMenuItem(this.item8)
		this.menu.addMenuItem(this.item9)
		this.menu.addMenuItem(this.item10)
		this.menu.addMenuItem(this.item11)
		this.menu.addMenuItem(this.item12)
		this.menu.addMenuItem(this.item13)
		this.menu.addMenuItem(this.item14)
		this.menu.addMenuItem(this.item15)

		//bind middle click option to toggle overview
		this.connect('button-press-event', _middleClick.bind(this));
	}

	setIconImage(){
		let iconIndex = this._settings.get_int('menu-button-icon-image');
		let path = Me.path + Constants.DistroIcons[iconIndex].PATH;
		if(Constants.DistroIcons[iconIndex].PATH === 'start-here-symbolic')
			path = 'start-here-symbolic';
		else if(!GLib.file_test(path, GLib.FileTest.IS_REGULAR))
			path = 'start-here-symbolic';  
		this.icon.gicon = Gio.icon_new_for_string(path);
	}

	setIconSize(){
		let iconSize = this._settings.get_int('menu-button-icon-size');
		this.icon.icon_size = iconSize;
	}
})

function init() {
}
 
function enable() {
	const activitiesButton = Main.panel.statusArea['activities']
	if (activitiesButton) {
		activitiesButton.container.hide()
	}

	let indicator = new MenuButton()
	Main.panel.addToStatusArea('menuButton', indicator, 0, 'left')

	// hide
	Main.panel.statusArea['menuButton'].visible = false

	// change icon
	//Main.panel.statusArea['menuButton'].icon.icon_name = "appointment-soon-symbolic"

	// show
	Main.panel.statusArea['menuButton'].visible = true
}
 
function disable() {
	const activitiesButton = Main.panel.statusArea['activities']
	if (activitiesButton) {
		activitiesButton.container.show()
	}

	Main.panel.statusArea['menuButton'].destroy()
}
