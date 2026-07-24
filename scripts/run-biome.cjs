#!/usr/bin/env node

const { spawnSync } = require("node:child_process");

const candidateMap = {
	darwin: ["arm64", "x64"],
	linux: ["x64", "arm64", "x64-musl", "arm64-musl"],
	win32: ["x64", "arm64"],
};

const packagePrefixByPlatform = {
	darwin: "@biomejs/cli-darwin-",
	linux: "@biomejs/cli-linux-",
	win32: "@biomejs/cli-win32-",
};

const executableNameByPlatform = {
	darwin: "biome",
	linux: "biome",
	win32: "biome.exe",
};

const biomePackagePath = (() => {
	try {
		return require.resolve("@biomejs/biome/package.json");
	} catch {
		return null;
	}
})();

const moveCurrentArchFirst = (architectures, currentArch) => {
	const ordered = [...architectures];
	const index = ordered.indexOf(currentArch);
	if (index > 0) {
		ordered.splice(index, 1);
		ordered.unshift(currentArch);
	}
	return ordered;
};

const resolveBiomeBinary = () => {
	if (process.env.BIOME_BINARY) {
		return process.env.BIOME_BINARY;
	}

	if (!biomePackagePath) {
		return null;
	}

	const platforms = candidateMap[process.platform];
	const packagePrefix = packagePrefixByPlatform[process.platform];
	const executableName = executableNameByPlatform[process.platform];

	if (!platforms || !packagePrefix || !executableName) {
		return null;
	}

	const architectures = moveCurrentArchFirst(platforms, process.arch);

	for (const architecture of architectures) {
		const packagePath = `${packagePrefix}${architecture}/${executableName}`;
		try {
			return require.resolve(packagePath, {
				paths: [biomePackagePath],
			});
		} catch {
			// Try next candidate.
		}
	}

	return null;
};

const biomeBinary = resolveBiomeBinary();

if (!biomeBinary) {
	console.error(
		`Biome binary could not be resolved for ${process.platform}/${process.arch}.`,
	);
	process.exit(1);
}

const result = spawnSync(biomeBinary, process.argv.slice(2), {
	stdio: "inherit",
	env: process.env,
});

if (result.error) {
	throw result.error;
}

process.exit(result.status ?? 1);
