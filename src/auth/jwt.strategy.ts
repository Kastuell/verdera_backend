import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request as RequestType } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserService } from '../user/user.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private configService: ConfigService,
		private userService: UserService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				JwtStrategy.extractJWT,
				ExtractJwt.fromAuthHeaderAsBearerToken(),
			]),
			ignoreExpiration: true,
			secretOrKey: configService.get('JWT_SECRET'),
		})
	}

	private static extractJWT(req: RequestType): string | null {
		if (
			req.cookies &&
			'accessToken' in req.cookies &&
			req.cookies.accessToken.length > 0
		) {
			return req.cookies.accessToken;
		}
		return null;
	}

	async validate(req: { id: number }) {
		const user = await this.userService.getById(req.id)
		return (user)
	}
}
