import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'নাম অবশ্যই স্ট্রিং (text) হতে হবে' })
  @IsNotEmpty({ message: 'নাম ফাঁকা রাখা যাবে না' })
  name: string;

  @IsEmail({}, { message: 'সঠিক ইমেইল এড্রেস দিতে হবে' })
  @IsNotEmpty({ message: 'ইমেইল ফাঁকা রাখা যাবে না' })
  email: string;
}
