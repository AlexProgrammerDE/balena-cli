/**
 * @license
 * Copyright 2019 Balena Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Command, flags } from '@oclif/command';
import { stripIndent } from 'common-tags';

import * as ec from '../../utils/env-common';
import { CommandHelp } from '../../utils/oclif-utils';

type IArg<T> = import('@oclif/parser').args.IArg<T>;

interface FlagsDef {
	config: boolean;
	device: boolean;
	service: boolean;
	yes: boolean;
}

interface ArgsDef {
	id: number;
}

export default class EnvRmCmd extends Command {
	public static description = stripIndent`
		Remove a config or env var from an application, device or service.

		Remove a configuration or environment variable from an application, device
		or service, as selected by command-line options.

		${ec.rmRenameHelp.split('\n').join('\n\t\t')}

		Interactive confirmation is normally asked before the variable is deleted.
		The --yes option disables this behaviour.
`;
	public static examples = [
		'$ balena env rm 215',
		'$ balena env rm 215 --yes',
		'$ balena env rm 215 --config',
		'$ balena env rm 215 --service',
		'$ balena env rm 215 --device',
		'$ balena env rm 215 --device --config',
		'$ balena env rm 215 --device --service --yes',
	];

	public static args: Array<IArg<any>> = [
		{
			name: 'id',
			required: true,
			description: "variable's numeric database ID",
			parse: input => ec.parseDbId(input),
		},
	];

	// hardcoded 'env rm' to avoid oclif's 'env:rm' topic syntax
	public static usage =
		'env rm ' + new CommandHelp({ args: EnvRmCmd.args }).defaultUsage();

	public static flags: flags.Input<FlagsDef> = {
		config: ec.booleanConfig,
		device: ec.booleanDevice,
		service: ec.booleanService,
		yes: flags.boolean({
			char: 'y',
			description:
				'do not prompt for confirmation before deleting the variable',
			default: false,
		}),
	};

	public async run() {
		const { args: params, flags: opt } = this.parse<FlagsDef, ArgsDef>(
			EnvRmCmd,
		);
		const balena = (await import('balena-sdk')).fromSharedOptions();
		const { checkLoggedIn, confirm } = await import('../../utils/patterns');

		await checkLoggedIn();

		await confirm(
			opt.yes || false,
			'Are you sure you want to delete the environment variable?',
			undefined,
			true,
		);

		await balena.pine.delete({
			resource: ec.getVarResourceName(opt.config, opt.device, opt.service),
			id: params.id,
		});
	}
}
