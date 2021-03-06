import * as EmailValidator from 'email-validator';
import { ObjectId } from 'mongodb';
import DB, { Models } from '../src/server/models';
import { LoginDbObject, UserType } from '../src/server/generated/graphql';

const printUsage = (): void => {
	void console.log(
		`Usage: ts-node -r dotenv/config ./scripts/makeOrganizer.ts -- YOUR_EMAIL@FOO.COM,BEN@FOO.COM [github | google]`
	);
};

const makeOrganizer = async (models: Models, constraint: Partial<LoginDbObject>): Promise<void> => {
	const user = await models.Hackers.findOne({ email: constraint.email });
	if (!user) {
		throw new Error(`Couldn't find user ${constraint.email} did you try logging in first?`);
	}

	// Update the user's login entry to point to organizers.
	const { value, ok, lastErrorObject } = await models.Logins.findOneAndUpdate(
		constraint,
		{ $set: { userType: UserType.Organizer } },
		{ returnOriginal: false }
	);
	if (!ok || !value) {
		throw new Error(`Error updating logins: ${JSON.stringify(lastErrorObject)}`);
	}

	// Only insert user into organizers collection if changing login was successful.
	const { result } = await models.Organizers.insertOne({
		...user,
		_id: new ObjectId(),
		logins: [value],
		permissions: [],
		userType: UserType.Organizer,
	});
	if (!result.ok) {
		throw new Error('Error: (Unspecified) while inserting user into organizers collection');
	}

	console.log(`${constraint.email} is now an organizer :) Happy hacking!`);
};

(async (): Promise<void> => {
	const args = process.argv.splice(process.execArgv.length);
	if (!args.length || args.length > 2 || !EmailValidator.validate(args[0])) printUsage();
	const models = await new DB().collections;

	try {
		await Promise.all(
			args[0].split(',').map(email => {
				const constraint: Partial<LoginDbObject> = args[1]
					? { email, provider: args[1] }
					: { email };

				return makeOrganizer(models, constraint);
			})
		);
		process.exit(0);
	} catch (e) {
		console.error(e);
		process.exit(1);
	}
})();
