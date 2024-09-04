import { Context } from "telegraf";
import { SceneContextScene, SceneSession, SceneSessionData } from "telegraf/typings/scenes";
import { SessionContext } from "telegraf/typings/session";

export interface BotContext extends Context {
	scene: SceneContextScene<SessionContext<SceneSession<Scenes>>>;
}

export interface Scenes extends SceneSessionData {
	acceptedOrder: {
		orderId: string;
		passengerId: number;
	};
}