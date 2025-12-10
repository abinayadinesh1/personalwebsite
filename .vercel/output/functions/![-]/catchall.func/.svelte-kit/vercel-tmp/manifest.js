export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["IMG_4363.jpg","IMG_6410.jpg","IMG_6795.jpg","IMG_9055.jpg","Screenshot 2024-11-19 at 4.00.38 PM.png","anthropocene.jpg","bg.jpg","bigthings.jpg","burden_of_joy.jpg","elec.jpg","final.jpg","fire.jpg","fonts/BerkeleyMonoTrial-Regular.otf","golden.jpeg","hailmary.jpg","homelessness.jpg","idea_factory.jpg","lelan_pic.png","light_mode.jpg","linalg.jpg","new_bg","polaroid_pic.png","pretty_image.jpg","secretlife.jpg","sound.jpeg","turtlebot_pic.png","weather.jpeg"]),
	mimeTypes: {".jpg":"image/jpeg",".png":"image/png",".otf":"font/otf",".jpeg":"image/jpeg"},
	_: {
		client: {start:"_app/immutable/entry/start.C6z_ecQb.js",app:"_app/immutable/entry/app.DaySKNAr.js",imports:["_app/immutable/entry/start.C6z_ecQb.js","_app/immutable/chunks/BhzJ0JCo.js","_app/immutable/chunks/BRAXwxwd.js","_app/immutable/entry/app.DaySKNAr.js","_app/immutable/chunks/BRAXwxwd.js","_app/immutable/chunks/Cm5b7JXn.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js')),
			__memo(() => import('../output/server/nodes/3.js')),
			__memo(() => import('../output/server/nodes/4.js')),
			__memo(() => import('../output/server/nodes/5.js')),
			__memo(() => import('../output/server/nodes/6.js')),
			__memo(() => import('../output/server/nodes/7.js')),
			__memo(() => import('../output/server/nodes/8.js')),
			__memo(() => import('../output/server/nodes/9.js')),
			__memo(() => import('../output/server/nodes/10.js')),
			__memo(() => import('../output/server/nodes/11.js')),
			__memo(() => import('../output/server/nodes/12.js')),
			__memo(() => import('../output/server/nodes/13.js')),
			__memo(() => import('../output/server/nodes/14.js')),
			__memo(() => import('../output/server/nodes/15.js')),
			__memo(() => import('../output/server/nodes/16.js')),
			__memo(() => import('../output/server/nodes/17.js')),
			__memo(() => import('../output/server/nodes/18.js')),
			__memo(() => import('../output/server/nodes/19.js')),
			__memo(() => import('../output/server/nodes/20.js')),
			__memo(() => import('../output/server/nodes/21.js')),
			__memo(() => import('../output/server/nodes/22.js')),
			__memo(() => import('../output/server/nodes/23.js')),
			__memo(() => import('../output/server/nodes/24.js')),
			__memo(() => import('../output/server/nodes/25.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/projects",
				pattern: /^\/projects\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/projects/bracketbots",
				pattern: /^\/projects\/bracketbots\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/projects/tinybots",
				pattern: /^\/projects\/tinybots\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/projects/turtlebot3",
				pattern: /^\/projects\/turtlebot3\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/reading",
				pattern: /^\/reading\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/reading/underactuated_robotics",
				pattern: /^\/reading\/underactuated_robotics\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/secret/coursework",
				pattern: /^\/secret\/coursework\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/secret/seneca",
				pattern: /^\/secret\/seneca\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/writing",
				pattern: /^\/writing\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/writing/agonpublichealth",
				pattern: /^\/writing\/agonpublichealth\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/writing/driving",
				pattern: /^\/writing\/driving\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/writing/economiesofscale",
				pattern: /^\/writing\/economiesofscale\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/writing/farmerinterviews/cloverfieldorganics",
				pattern: /^\/writing\/farmerinterviews\/cloverfieldorganics\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/writing/farmerinterviews/durstorganic",
				pattern: /^\/writing\/farmerinterviews\/durstorganic\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/writing/farmerinterviews/parkfarming",
				pattern: /^\/writing\/farmerinterviews\/parkfarming\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/writing/farmerinterviews/rattobrothers",
				pattern: /^\/writing\/farmerinterviews\/rattobrothers\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/writing/fav_pubs",
				pattern: /^\/writing\/fav_pubs\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/writing/homeforgenius",
				pattern: /^\/writing\/homeforgenius\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/writing/notes",
				pattern: /^\/writing\/notes\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/writing/phofsoil",
				pattern: /^\/writing\/phofsoil\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/writing/readthenews",
				pattern: /^\/writing\/readthenews\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/writing/researcher",
				pattern: /^\/writing\/researcher\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 24 },
				endpoint: null
			},
			{
				id: "/writing/spectrometer",
				pattern: /^\/writing\/spectrometer\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 25 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
