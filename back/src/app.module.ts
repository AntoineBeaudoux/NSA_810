import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configDatabase } from './db/config/config.bd';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { Models } from "src/db/models.db";
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        name: "CIA_PROJECT",
        type: "mysql",
        host: configDatabase.DB_HOST,
        port: configDatabase.DB_PORT,
        username: configDatabase.MYSQL_USER,
        password: configDatabase.MYSQL_PASSWORD,
        database: configDatabase.MYSQL_DATABASE,
        synchronize: true,
        entities: Models
      }),
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}