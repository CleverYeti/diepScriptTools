// ==UserScript==
// @name         Diep Script Tools
// @version      1.0
// @author       Clever yeti
// @match        https://diep.io/*
// @run-at       document-start
// @require      https://raw.githubusercontent.com/CleverYeti/diepScriptTools/refs/heads/main/profanityFilter.js
// ==/UserScript==



const dst = {
	DEBUG: {
		logGameInfo: false,
		logScreenInfo: false,
		logKeyEvents: false,
		logBindEvents: false,
	},
    window: typeof unsafeWindow != "undefined" ? unsafeWindow : window,
    scripts: {},
    
    registerScript: function(script) {
        if (this.scripts[script.id] != undefined) return this.showError("two scripts with the same id (" + script.id + ") are being registered")
        this.scripts[script.id] = script
    },

    init: function() {
		dst.window.dst = dst

		// load settings
		try {
			dst.savedSettings = window.localStorage.getItem("dst_settings") ? JSON.parse(window.localStorage.getItem("dst_settings")) : {keybinds: {}}
		} catch {
			alert("failed to load DST settings")
		}

		// default keybinds
		dst.registerDefaultKeybind("Main Keybinds", "move_up", [87,38], 23)
		dst.registerDefaultKeybind("Main Keybinds", "move_right", [68,39], 4)
		dst.registerDefaultKeybind("Main Keybinds", "move_down", [83,40], 19)
		dst.registerDefaultKeybind("Main Keybinds", "move_left", [65,37], 1)

		dst.registerDefaultKeybind("Main Keybinds", "fire", [32, 0], 36)
		dst.registerDefaultKeybind("Main Keybinds", "secondary", [16, 2], 34)
		dst.registerDefaultKeybind("Main Keybinds", "auto_fire", [69], 5)
		dst.registerDefaultKeybind("Main Keybinds", "auto_spin", [67], 3)
		
		dst.registerDefaultKeybind("Stats", "queue_stat", [85], 21)
		dst.registerDefaultKeybind("Stats", "max_stat", [77], 13)
		dst.registerDefaultKeybind("Stats", "stat_1", [49], 48)
		dst.registerDefaultKeybind("Stats", "stat_2", [50], 49)
		dst.registerDefaultKeybind("Stats", "stat_3", [51], 50)
		dst.registerDefaultKeybind("Stats", "stat_4", [52], 51)
		dst.registerDefaultKeybind("Stats", "stat_5", [53], 52)
		dst.registerDefaultKeybind("Stats", "stat_6", [54], 53)
		dst.registerDefaultKeybind("Stats", "stat_7", [55], 54)
		dst.registerDefaultKeybind("Stats", "stat_8", [56], 55)
		
		dst.registerDefaultKeybind("Sandbox Cheats", "self_destruct", [79], 15)
		dst.registerDefaultKeybind("Sandbox Cheats", "level_up", [75], 11)
		dst.registerDefaultKeybind("Sandbox Cheats", "god_mode", [186], 60)
		dst.registerDefaultKeybind("Sandbox Cheats", "switch_tank", [191], 64)
		
		dst.registerDefaultKeybind("Misc", "show_tree", [89], 25)
		dst.registerDefaultKeybind("Misc", "show_player_list", [9], 31)
		dst.registerDefaultKeybind("Misc", "show_ping", [76], 12)
		dst.registerDefaultKeybind("Misc", "spawn", [13], 32)
		dst.registerDefaultKeybind("Misc", "take_dominator", [72], 8)
		dst.registerDefaultKeybind("Misc", "fullscreen", [113], 57)
		dst.registerDefaultKeybind("Misc", "open_console", [36], 59)

		dst.registerKeybind("DST", "toggle_dst_settings", [226])
		dst.listenToKeybind("toggle_dst_settings", dst.toggleConfigScreen, true)

		// censoring
		dst.registerSetting("misc", "censor_player_names", false, "bool")

		console.log(this.keybinds)
		
		// mouse reading
		document.addEventListener("mousemove", (event) => {
			dst.gameInfo.screenMousePosition = {x: event.clientX, y: event.clientY}
			dst.gameInfo.worldMousePosition = dst.screenToWorldPosition(dst.gameInfo.screenMousePosition)
		});

		// detecting when ready
        const interval = this.window.setInterval(function() {
            if(this.window.input != null) {
                this.window.clearInterval(interval);
                dst.onready();
            }
        }, 100)
    },
    
    // main part of the script
    onready: function() {

		dst.injectCSS(`
			#openDSTSettings {
				position: fixed;
				top: 0.5rem;
				left: 0.5rem;
				z-index: 9999999;
				place-content: center;
				border-radius: 0.375rem;
				padding: 0 0.75rem;
				height: 2rem;
				box-shadow: inset 0 0 0 0.1875rem var(--border-color), inset 0 -0.5rem #0000001b;
				cursor: pointer;
				background: #2D5AFF;
				display: none;
			}
			#openDSTSettings.active {display: grid}

			#DSTConfig {
				position: fixed;
				inset: 0;
				width: 100%;
				height: 100vh;
				margin: 0;
				display: flex;
				justify-content: center;
				z-index: 999999;
				padding: 2rem;
			}
			
			#DSTConfig > .menu {
				width: 50rem;
				height: calc(100vh - 4rem);
				border-radius: 0.5rem;
				box-shadow: inset 0 0 0 0.25rem var(--border-color);
				background: #00000055;
				overflow-y: auto;
				backdrop-filter: blur(0.5rem)
			}
			
			.DSTText {
				font-family: "Ubuntu", sans-serif;
				color: white;
				text-shadow: calc(1* 0.4px) calc(1* 0.4px) 0 #000, calc(-1* 0.4px) calc(1* 0.4px) 0 #000, calc(1* 0.4px) calc(-1* 0.4px) 0 #000, calc(-1* 0.4px) calc(-1* 0.4px) 0 #000, calc(0* 0.4px) calc(1* 0.4px) 0 #000, calc(0* 0.4px) calc(-1* 0.4px) 0 #000, calc(-1* 0.4px) calc(0* 0.4px) 0 #000, calc(1* 0.4px) calc(0* 0.4px) 0 #000, calc(2* 0.4px) calc(2* 0.4px) 0 #000, calc(-2* 0.4px) calc(2* 0.4px) 0 #000, calc(2* 0.4px) calc(-2* 0.4px) 0 #000, calc(-2* 0.4px) calc(-2* 0.4px) 0 #000, calc(0* 0.4px) calc(2* 0.4px) 0 #000, calc(0* 0.4px) calc(-2* 0.4px) 0 #000, calc(-2* 0.4px) calc(0* 0.4px) 0 #000, calc(2* 0.4px) calc(0* 0.4px) 0 #000, calc(1* 0.4px) calc(2* 0.4px) 0 #000, calc(-1* 0.4px) calc(2* 0.4px) 0 #000, calc(1* 0.4px) calc(-2* 0.4px) 0 #000, calc(-1* 0.4px) calc(-2* 0.4px) 0 #000, calc(2* 0.4px) calc(1* 0.4px) 0 #000, calc(-2* 0.4px) calc(1* 0.4px) 0 #000, calc(2* 0.4px) calc(-1* 0.4px) 0 #000, calc(-2* 0.4px) calc(-1* 0.4px) 0 #000;
			}
			
			#DSTConfig > .menu > .header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				height: 10rem;
				padding: 0 2rem;
			}
			
			#DSTConfig > .menu > .header > .logo {
				height: 7rem;
			}
			
			#DSTConfig > .menu > .header > .buttons {
				
			}
			
			#DSTConfig > .menu > .header > .buttons > .button {
				display: grid;
				place-content: center;
				width: 9rem;
				border-radius: 0.375rem;
				height: 2.75rem;
				margin: 0.25rem;
				box-shadow: inset 0 0 0 0.1875rem var(--border-color), inset 0 -0.5rem #0000001b;
				cursor: pointer;
			}
			
			#DSTConfig > .menu > .header > .buttons > .importButton {
				background: #2298FF;
			}
			#DSTConfig > .menu > .header > .buttons > .exportButton {
				background: #2D5AFF;
			}
			
			
			#DSTConfig > .menu > .seperator {
				height: 0.25rem;
				margin: 0 1rem;
				background: var(--border-color)
			}
			
			#DSTConfig > .menu > .settings {
				padding: 0 2rem 1.5rem 2rem;
			}
			#DSTConfig > .menu > .settings > .settingSectionTitle {
				margin-top: 1.5rem;
				margin-bottom: 0.5rem;
				font-weight: 600;
			}
			#DSTConfig > .menu > .settings > .settingLine {
				height: 2.5rem;
				padding: 0 1rem;
				display: flex;
				align-items: center;
				justify-content: space-between;
				border-radius: 0.5rem;
			}
			#DSTConfig > .menu > .settings > .settingLine:hover {
				background: #00000044;
			}
			
			#DSTConfig > .menu > .settings > .settingLine > .bindList {
				display: flex;
				flex-direction: row-reverse;
				gap: 0.25rem;
			}
			#DSTConfig > .menu > .settings > .settingLine > .bindList > .bind {
				display: grid;
				place-content: center;
				border-radius: 0.375rem;
				padding: 0 0.75rem;
				height: 2rem;
				box-shadow: inset 0 0 0 0.1875rem var(--border-color), inset 0 -0.5rem #0000001b;
				cursor: pointer;
				background: #2298FF;
			}
			
			#DSTConfig > .menu > .settings > .settingLine > .bindList > .bind:hover {
				background: red;			
			}

			#DSTConfig > .menu > .settings > .settingLine > .bindList > .addBind {
				display: grid;
				place-content: center;
				border-radius: 0.375rem;
				height: 2rem;
				width: 2rem;
				font-size: 1.25rem;
				box-shadow: inset 0 0 0 0.1875rem var(--border-color), inset 0 -0.5rem #0000001b;
				cursor: pointer;
				background: #2D5AFF;
			}
			
			#DSTConfig > .menu > .settings > .settingLine > .bindList > .addBind.active {
				width: auto;
				font-size: 1rem;
				padding: 0 0.75rem;
			}
			
			#DSTConfig > .menu > .settings > .settingLine > .toggle {
				position: relative;
				background: #888;
				border-radius: 0.375rem;
				box-shadow: inset 0 0 0 0.1875rem var(--border-color), inset 0 -0.5rem #0000001b;
				cursor: pointer;
				height: 1.25rem;
				width: 2.5rem;
			}

			#DSTConfig > .menu > .settings > .settingLine > .toggle:after {
				position: absolute;
				content: "";
				inset: -0.25rem auto -0.25rem -0.25rem;
				width: 1.75rem;
				height: 1.75rem;
				border-radius: 0.375rem;
				box-shadow: inset 0 0 0 0.1875rem var(--border-color), inset 0 -0.5rem #0000001b;
				cursor: pointer;
				background: #bbb;
			}

			#DSTConfig > .menu > .settings > .settingLine > .toggle.active:after {
				inset: -0.25rem -0.25rem -0.25rem auto;
				background: #2298FF;
			}
			
		`)
		
		// call onready for all scripts
        for (let scriptId in this.scripts) {
            const script = this.scripts[scriptId]
            if (script.onready) script.onready()
        }

		// replace keydown functions
		this.extern = {}
		this.extern.onKeyDown = extern.onKeyDown
		this.extern.onKeyUp = extern.onKeyUp
		extern.onKeyDown = (keynum) => {}
		extern.onKeyUp = (keynum) => {}

		// listen to key presses
		function handleKeyEvent(key, isPress) {
			if (dst.DEBUG.logKeyEvents) console.log("key event", key, isPress)
			
			if (isPress) {
				if (document.querySelector('#spawn-input > input:focus')) {
					return
				}
				if (dst.listenToNextKeyCallback) {
					dst.listenToNextKeyCallback(key)
					return
				}
				if (key == 0 && (dst.isConfigOpen || dst.gameInfo.currentScreen != "in_game")) {
					return
				}
			}
			
			for (let keybindId in dst.keybinds) {
				const keybind = dst.keybinds[keybindId]
				if (keybind.keys.includes(key)) {
					dst.setBindState(keybindId, isPress)
				}
			}
		}
		this.window.addEventListener("keydown", event => {
			handleKeyEvent(event.which, true)
		})
		this.window.addEventListener("keyup", event => {
			handleKeyEvent(event.which, false)
		})
		this.window.addEventListener("mousedown", event => {
			handleKeyEvent(event.button, true)
			if (event.button == 4 || event.button == 5) {
				e.stopPropagation()
				e.preventDefault()
			}
		})
		this.window.addEventListener("mouseup", event => {
			handleKeyEvent(event.button, false)
		})

		// party link management
		const _copyToKeyboard = dst.window.copyToKeyboard
		function copyToKeyboard(text) {
			let url
			try {
				url = URL.parse(text)
			} catch {
				console.log("failed parsing party link")
				return
			}
			dst.gameInfo.partyId = url.searchParams.get("p")
			dst.copyPartyLink()
		}
		dst.window.copyToKeyboard = copyToKeyboard

		dst.registerTickFunction(() => {
			if (dst.window.document.querySelector("#copy-party-link.active") && ["in-game", "game-over"].includes(dst.gameInfo.gameState)) {
				if (!dst.gameInfo.partyId) {
					dst.window.document.querySelector("#copy-party-link").click()
				}
			} else {
				if (dst.gameInfo.partyId) {
					dst.gameInfo.partyId = null
					dst.copyPartyLink()
				}
			}
		})

		// initialising overlay canvas
		this.overlayCanvas = document.createElement("canvas")
		this.overlayCanvas.style.position = "fixed"
		this.overlayCanvas.style.inset = "0"
		this.overlayCanvas.style.zIndex = "9999999"
		this.overlayCanvas.style.pointerEvents = "none"
		document.body.appendChild(this.overlayCanvas)
		this.overlayCtx = this.overlayCanvas.getContext('2d');
		
		// starting tick loop
		dst.triggerEvent("ready")
		this.tick()

	},

    // errors
    showError: function(errorText) {
        console.warn("dst error:", errorText)
        //alert("dst error: " + JSON.stringify(errorText, null, 2))
    },

	// ticking and overlays
	overlayCanvas: null,
	overlayCtx: null,
	tickFunctions: [],
	lastFrameTime: null,
	tick: function(time = null) {
		this.window.requestAnimationFrame(()=>{dst.tick()})

		// deltaTime calculation
		if (time == null) {
			time = Date.now();
			this.screenInfo.frameDeltaTime = 0
			this.screenInfo.frameRate = 0
		} else if (this.lastFrameTime == null) {
			this.lastFrameTime = time
			this.screenInfo.frameDeltaTime = 0
			this.screenInfo.frameRate = 0
		} else {
			this.screenInfo.frameDeltaTime = time - this.lastFrameTime
			this.screenInfo.frameRate = 1000 / frameDeltaTime
		}

		// clearing canvas
		this.overlayCanvas.width  = window.innerWidth;
		this.overlayCanvas.height  = window.innerHeight;
		this.overlayCtx.clearRect(0, 0, canvas.width, canvas.height);

		// last gameInfo
		dst.previousGameInfo = JSON.parse(JSON.stringify(dst.gameInfo))

		// tick functions
		for (let func of this.tickFunctions) {
			func(this.screenInfo.frameDeltaTime, this.overlayCtx)
		}

		if (this.DEBUG.logGameInfo) console.log(this.gameInfo)
		if (this.DEBUG.logScreenInfo) console.log(this.screenInfo)
	},
	registerTickFunction(func = (deltaTime, ctx) => {}) {
		this.tickFunctions.push(func)
	},

    // keybind management
	listenToNextKeyCallback: null,
	keybinds: {},
	keyNames: ["left mouse","middle mouse","right mouse","mouse 4","mouse 5",0,0,0,"backspace","tab",0,0,0,"enter",0,0,"shift","ctrl","alt","pause","caps lock",0,0,0,0,0,0,"esc",0,0,0,0,"space","page up","page down","end","home","left arrow","up arrow","right arrow","down arrow",0,0,0,"print screen","insert","delete",0,"0","1","2","3","4","5","6","7","8","9",0,0,0,0,0,0,0,"a","b","c","d","e","f","g","h","i","j","k","l","m","m","o","p","q","r","s","t","u","v","w","x","y","z",0,0,0,0,0,"numpad 0","numpad 1","numpad 2","numpad 3","numpad 4","numpad 5","numpad 6","numpad 7","numpad 8","numpad 9","numpad multiply","numpad add",0,"numpad subtract","numpad point","numpad divide","f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"num lock","scroll lock",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"semi-colon","equal","comma","dash","period","slash","backquote",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"open bracket","back slash","close bracket","quote",0,0,0,"back slash"],
    registerDefaultKeybind: function(settingGroupId, keybindId, defaultKeys, keyToPress) {
        if (this.keybinds[keybindId] != undefined) return this.showError("two keybinds with the same id (" + keybindId + ") are being registered")
		const keys = dst.savedSettings.keybinds[keybindId] ? dst.savedSettings.keybinds[keybindId].keys : defaultKeys
		this.keybinds[keybindId] = {settingGroupId: settingGroupId, defaultKeys: defaultKeys, keys: keys, listeners: [], isPressed: false, isDefault: true}
		this.listenToKeybind(keybindId, ()=>{this.extern.onKeyDown(keyToPress)}, true)
		this.listenToKeybind(keybindId, ()=>{this.extern.onKeyUp(keyToPress)}, false)
	},
    registerKeybind: function(settingGroupId, keybindId, defaultKeys) {
        if (this.keybinds[keybindId] != undefined) return this.showError("two keybinds with the same id (" + keybindId + ") are being registered")
		const keys = dst.savedSettings.keybinds[keybindId] ? dst.savedSettings.keybinds[keybindId].keys : defaultKeys
        this.keybinds[keybindId] = {settingGroupId: settingGroupId, defaultKeys: defaultKeys, keys: keys, listeners: [], isPressed: false}
    },
    listenToKeybind: function(keybindId, func, isPress) {
        const targetBind = this.keybinds[keybindId]
        if (targetBind == undefined) return this.showError("cannot listen to inexistant keybind  (" + keybindId + ")")
        targetBind.listeners.push({isPress:isPress, func:func})
    },
    setBindState: function(keybindId, isPress) {
        const targetBind = this.keybinds[keybindId]
        if (!targetBind) this.showError("cannot press/release inexistant keybind (" + keybindId + ")")
		if (targetBind.isPressed == isPress) return
		targetBind.isPressed = isPress
		if (this.DEBUG.logBindEvents) console.log("setBindState", keybindId, isPress)
        targetBind.listeners.forEach(listener => {
			if (listener.isPress == isPress) listener.func()
		});
    },

	// setting management
	savedSettings: {},
	settings: {},
	settingsAreImported: false,
	registerSetting: function(settingGroupId, settingId, defaultValue, valueType) {
		const valueTypes = ["bool"]
        if (this.settings[settingId] != undefined) return this.showError("two settings with the same id (" + settingId + ") are being registered")
		if (!valueTypes.includes(valueType)) return this.showError("invalid setting value type (" + valueType + ") settingId: " + settingId)
		this.settings[settingId] = {settingGroupId: settingGroupId, defaultValue: defaultValue, value: dst.savedSettings[settingId] ?? defaultValue, valueType: valueType, listeners: []}
	},
	listenToSettingChange(settingId, func = (newValue, previousValue) => {}) {
        if (this.settings[settingId] != undefined) return this.showError("cannot listen to changes in inexistant setting (" + settingId + ")")
		this.settings[settingId].listeners.push(func)
	},
	getSettingsAsJson: function() {
		if (this.settingsAreImported) return
		const formatted = {}
		for (let settingId in dst.settings) {
			formatted[settingId] = dst.settings[settingId].value
		}
		formatted.keybinds = {}
		for (keybindId in dst.keybinds) {
			formatted.keybinds[keybindId] = {keys: dst.keybinds[keybindId].keys}
		}
		return formatted
	},
	saveSettings: function(settings) {
		window.localStorage.setItem("dst_settings", JSON.stringify(this.getSettingsAsJson()));
	},
	importSettings: function() {
		const input = prompt("Paste saved keybinds here")
		if (input == null) return
		try {
			window.localStorage.setItem("dst_settings", JSON.stringify(JSON.parse(input)));
			dst.settingsAreImported = true
			alert("Reload the page to apply imported settings")
		} catch {
			alert("Invalid settings JSON")
		}
	},
	exportSettings: function() {
		prompt("Copy the text below:", JSON.stringify(dst.getSettingsAsJson()))
	},

	// event management
	events: {},
	listenToEvent: function(eventId, func = (event) => {}) {
		if (dst.events[eventId] == undefined) dst.events[eventId] = {listeners: []}
		dst.events[eventId].listeners.push(func)
	},
	triggerEvent: function(eventId, eventData) {
		if (dst.events[eventId] == undefined) dst.events[eventId] = {listeners: []}
		for (let listener of dst.events[eventId].listeners) {
			listener(eventData)
		}
	},

	// utility functions
	getPolygonCenter: function(points){
		let avg = {x:0, y:0};
		for(let i = 0; i < points.length; i++){
			avg.x += points[i].x;
			avg.y += points[i].y;
		}
		avg.x /= points.length;
		avg.y /= points.length;
		return avg;
	},

	screenToWorldPosition: function(pos) {
		return {
		  x: this.gameInfo.position.x + (pos.x - window.innerWidth / 2) / (this.screenInfo.fov / 2.8),
		  y: this.gameInfo.position.y + (pos.y - window.innerHeight / 2) / (this.screenInfo.fov / 2.8),
		}
	},

	worldToScreenPosition: function(pos) {
		return {
			x: (window.innerWidth / 2) + (pos.x - this.gameInfo.position.x) * (this.screenInfo.fov / 2.8),
			y: (window.innerHeight / 2) + (pos.y - this.gameInfo.position.y) * (this.screenInfo.fov / 2.8)
		}
	},

	minimapToWorldPos(pos) {
		return {
			x: ((pos.x - dst.screenInfo.minimap.x) / dst.screenInfo.minimap.width) * dst.gameInfo.arenaWidth,
			y: ((pos.y - dst.screenInfo.minimap.y) / dst.screenInfo.minimap.height) * dst.gameInfo.arenaHeight,
		}
	},

	worldToMinimapPos(pos) {
		return {
		  	x: this.screenInfo.minimap.width * (pos.x / this.gameInfo.arenaWidth) + this.screenInfo.minimap.x,
		  	y: this.screenInfo.minimap.height * (pos.y / this.gameInfo.arenaHeight) + this.screenInfo.minimap.y,
		}
	},

	// game info
	gameInfo: {
		gameMode: "ffa",
		region: "atl",
		partyId: null,
		dstPartyId: "wow",
		isConnected: false,
		
		gameState: null,
		currentScreen: "home",

		arenaWidth: 26000,
		arenaHeight: 26000,
		
		isAlive: false,
		health: 0,
		maxHealth: 0,
		statPoints: [null,0,0,0,0,0,0,0,0],
		position: {x:0,y:0},
		playerRotation: 0, // computed from position and worldMousePosition 
		teamName: "",
		teamNumber: 0, // 0,1,2,3
		username: "",
		treatedUsername: "", // replaces nothing with unnamed tank
		level: 0,
		score: 0,
		tank: "", //
		tankTier: 0, // currently selected tank tier
		leaderboard: [], // {username:, score:, tank}
		kills: [], // {username:, gainedScore:}
		screenMousePosition: {x:0, y:0},
		worldMousePosition: {x:0, y:0},
	},
	previousGameInfo: {},

	screenInfo: {
		minimap: {x: 0, y: 0, width: 0, height: 0},
		fov: 0,
		frameRate: 0,
		frameDeltaTime: 0,
	},

	// text censoring
	filterText: function(text) {
		if (dst.settings["censor_player_names"].value) {
			return profanityFilter.filter(text)
		} else {
			return text
		}
	},

	// css injection
	injectCSS: function(css) {
		let el = document.createElement("style")
		el.innerHTML = css
		this.window.document.body.appendChild(el)
	},

	// simplifying html element creation 
	htmlEl: function(type, classes, extraFunc = null, children = []) {
		const el = document.createElement(type)
		for (let cl of classes.split(" ")) {
			if (cl) el.classList.add(cl)
		}
		for (let child of children) {
			if (typeof child == "string") {
				el.appendChild(this.htmlText(child))
			} else {
				el.appendChild(child)
			}
		}
		if (extraFunc) extraFunc(el)
		return el
	},
	htmlText: function(text) {
		return document.createTextNode(text)
	},

	// swapping in the party link for the modified one
	copyPartyLink: function() {
		const url = URL.parse("https://diep.io")
		if (dst.gameInfo.partyId) {
			url.searchParams.append("p", dst.gameInfo.partyId)
		}
		// no dst id for now
		//if (dst.gameInfo.dstPartyId) {
		//	url.searchParams.append("dstparty", dst.gameInfo.dstPartyId)
		//}
		dst.window.navigator.clipboard.writeText(url.toString())
		window.history.pushState({ path: url.toString() }, '', url.toString());
	},

	// config screen
	isConfigOpen: false,
	toggleConfigScreen: function() {
		dst.isConfigOpen = !dst.isConfigOpen

		if (dst.isConfigOpen) {
			dst.renderConfigScreen()
		} else {
			dst.window.document.getElementById("DSTConfig").remove()
			dst.saveSettings()
		}
	},
	renderConfigScreen: function() {
		if (document.getElementById("DSTConfig")) return
		
		const settingGroups = []
		const keybindGroups = []
		
		for (let settingId in this.settings) {
			if (!settingGroups.includes(this.settings[settingId].settingGroupId)) {
				settingGroups.push(this.settings[settingId].settingGroupId)
			}
		}
		for (let keybindId in this.keybinds) {
			if (!keybindGroups.includes(this.keybinds[keybindId].settingGroupId)) {
				keybindGroups.push(this.keybinds[keybindId].settingGroupId)
			}
		}

		const settingEls = []
		for (let group of settingGroups) {
			settingEls.push(this.htmlEl("div", "settingSectionTitle", null, [group]))
			for (let settingId in this.settings) {
				const setting = this.settings[settingId]
				if (setting.settingGroupId != group) continue
				settingEls.push(this.renderConfigSetting(settingId))
			}
		}
		const keybindEls = []
		for (let group of keybindGroups) {
			keybindEls.push(this.htmlEl("div", "settingSectionTitle", null, [group]))
			for (let keybindId in this.keybinds) {
				const keybind = this.keybinds[keybindId]
				if (keybind.settingGroupId != group) continue
				keybindEls.push(this.renderConfigKeybind(keybindId))
			}
		}
		const configScreen = this.htmlEl("div", "DSTText", el => {
			el.id = "DSTConfig"
			el.addEventListener("click", (event) => {if (event.target.id == "DSTConfig") dst.toggleConfigScreen()})
		}, [
			this.htmlEl("div", "menu", null, [
				this.htmlEl("div", "header", null, [
					this.htmlEl("img", "logo", el => el.src = "https://raw.githubusercontent.com/CleverYeti/diepscripttools/refs/heads/main/logo.png"),
					this.htmlEl("div", "buttons", null, [
						this.htmlEl("div", "button importButton", el => el.addEventListener("click", dst.importSettings), ["Import Settings"]),
						this.htmlEl("div", "button importButton", el => el.addEventListener("click", dst.exportSettings), ["Export Settings"]),
					]),
				]),
				this.htmlEl("div", "seperator"),
				this.htmlEl("div", "settings", null, settingEls),
				this.htmlEl("div", "seperator"),
				this.htmlEl("div", "settings", null, keybindEls),
			])
		])
		document.body.appendChild(configScreen)
	},
	renderConfigSetting: function(settingId) {
		const setting = dst.settings[settingId]
		switch(setting.valueType) {
			case "bool":
				return this.htmlEl("div", "settingLine", null, [
					this.htmlEl("div", "settingName", null, [
						settingId.replaceAll("_", " ")
					]),
					this.htmlEl("div", setting.value ? "toggle active" : "toggle", (el) => {
						el.addEventListener("click", () => {
							for (let listener in setting.listeners) listener(!setting.value, setting.value)
							setting.value = !setting.value
							el.classList.toggle("active")
						})
					}, [])
				])
		}
	},
	renderConfigKeybind: function(keybindId) {
		function renderKeyBtn(bind, key) {
			return dst.htmlEl("div", "bind", el => el.addEventListener("click", () => {
				bind.keys.splice(bind.keys.indexOf(key), 1)
				el.remove()
			}), [
				"" + dst.keyNames[key]
			])
		}

		function addBind() {
			if (dst.listenToNextKeyCallback) return
			el.querySelector(".addBind").innerText = "press any key"
			el.querySelector(".addBind").classList.add("active")
			dst.listenToNextKeyCallback = (key) => {
				dst.listenToNextKeyCallback = null
				el.querySelector(".addBind").innerText = "+"
				el.querySelector(".addBind").classList.remove("active")
				if (!bind.keys.includes(key) && key != 27) {
					bind.keys.push(key)
					el.querySelector(".bindList").appendChild(
						renderKeyBtn(bind, key)
					)
				}
			} 
		}
		const bind = this.keybinds[keybindId]
		const el = this.htmlEl("div", "settingLine", null, [
			this.htmlEl("div", "settingName", null, [
				keybindId.replaceAll("_", " ")
			]),
			this.htmlEl("div", "bindList", null, [
				this.htmlEl("div", "addBind", el => el.addEventListener("click", addBind), ["+"]),
				...bind.keys.map(key => renderKeyBtn(bind, key)),
			])
		])
		return el
	},
}
dst.init()




// tracking which screen is active and the gameState
dst.registerTickFunction(() => {
	const screens = ["loading", "status_message", "home", "in_game", "game_over"]
	let newScreen = null
	for (screen of screens) {
		if (dst.window.document.querySelector("#" + screen.replaceAll("_", "-") + "-screen.active")) {
			newScreen = screen
		}
	}
	if (newScreen != dst.gameInfo.currentScreen) {
		dst.triggerEvent("screenChange", {oldScreen: dst.gameInfo.currentScreen, newScreen: newScreen})
		dst.gameInfo.currentScreen = newScreen
	}
	dst.gameInfo.gameState = dst.window.document.getElementById("home-screen").getAttribute("x-state")
	dst.gameInfo.isConnected = ["awaiting-spawn", "in-game", "game-over"].includes(dst.gameInfo.gameState)
})

// button to open dst settings
dst.listenToEvent("ready", () => {
	console.log("e")
	dst.window.document.body.appendChild(dst.htmlEl("div", "DSTText", (el) => {
		el.id = "openDSTSettings"
		el.addEventListener("click", dst.toggleConfigScreen)
	}, ["DST Settings"]))
})
dst.registerTickFunction(() => {
	if (dst.gameInfo.currentScreen == "home" || dst.isConfigOpen) {
		document.getElementById("openDSTSettings").classList.add("active")
	} else {
		document.getElementById("openDSTSettings").classList.remove("active")
	}
})

// hooking into functions
// preventing detection of modified functions
const _toString = Function.prototype.toString;
const toString = function() {
	switch(this) {

	case beginPath: return _toString.call(_beginPath);
	case moveTo: return _toString.call(_moveTo);
	case lineTo: return _toString.call(_lineTo);
	case fill: return _toString.call(_fill);
	case strokeText: return _toString.call(_strokeText);
	case fillText: return _toString.call(_fillText);
	case strokeRect: return _toString.call(_strokeRect);
	case stroke: return _toString.call(_stroke);
	case toString: return _toString.call(_toString);

	}
	return _toString.call(this);
};

Function.prototype.toString = toString;


const ctxPrototype = CanvasRenderingContext2D.prototype;
const _beginPath = ctxPrototype.beginPath;
const _moveTo = ctxPrototype.moveTo;
const _lineTo = ctxPrototype.lineTo;
const _fill = ctxPrototype.fill;
const _strokeText = ctxPrototype.strokeText;
const _fillText = ctxPrototype.fillText;
const _strokeRect = ctxPrototype.strokeRect;
const _stroke = ctxPrototype.stroke;


let vertices_amount = -1;
let vertices = [];
const beginPath = function (...args) {
	vertices_amount = 0;
	vertices = [];

	_beginPath.call(this, ...args)
}
const moveTo = function (...args) {
	vertices_amount++;
	vertices.push({x: args[0], y: args[1]});
	_moveTo.call(this, ...args);
}
const lineTo = new Proxy(_lineTo, {
	apply(method, context, args) {
		vertices_amount++;
		vertices.push({x: args[0], y: args[1]});
		return Reflect.apply(method, context, args);
	}
});
const fill = function (...args) {
	if (this.fillStyle == "#000000" && this.globalAlpha > 0.949 && vertices_amount == 3) {
		dst.gameInfo.position = dst.minimapToWorldPos(dst.getPolygonCenter(vertices))
	}
	vertices_amount = -1;
	vertices = [];

	_fill.call(this, ...args);
}
const strokeText = function (...args) {
	if (args[0].startsWith("Lvl ")) {
		dst.gameInfo.level = Number(args[0].split(" ")[1]);
		dst.gameInfo.tank = args[0].split(" ")[2];

	} else if (args[0].startsWith("Score:")) {
		dst.gameInfo.score = Number(args[0].split(" ")[1]);

	}
	args[0] = dst.filterText(args[0])
	_strokeText.call(this, ...args);
}
const fillText = function (...args) {
	args[0] = dst.filterText(args[0])
	_fillText.call(this, ...args);
}
const strokeRect = function (...args) {
	const transform = this.getTransform();
	dst.screenInfo.minimap.x = transform.e
	dst.screenInfo.minimap.y = transform.f
	dst.screenInfo.minimap.width = transform.a
	dst.screenInfo.minimap.height = transform.d

	_strokeRect.call(this, ...args);
};
const stroke = function (...args) {
	if (["#cccccc", "#cdcdcd"].includes(this.fillStyle) && this.strokeStyle == '#000000') {
		dst.screenInfo.fov = this.globalAlpha / 0.05;
	}
	_stroke.call(this, ...args);
}

ctxPrototype.beginPath = beginPath;
ctxPrototype.moveTo = moveTo;
ctxPrototype.lineTo = lineTo;
ctxPrototype.fill = fill;
ctxPrototype.strokeRect = strokeRect;
ctxPrototype.strokeText = strokeText;
ctxPrototype.fillText = fillText;
ctxPrototype.stroke = stroke;

//Object.freeze(ctxPrototype);
//Object.freeze(Function.prototype);





// events:
// kill {player:{username:, gainedScore:}}
// death {killer:{username:},gameInfoOnDeath:{<gameInfo>}}

