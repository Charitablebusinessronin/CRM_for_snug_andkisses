{ pkgs }: {
	env = {
		NODE_VERSION = "16.20.2";
	};
	deps = [
		pkgs.nodejs-16_x
		pkgs.nodePackages.npm
	];
}



