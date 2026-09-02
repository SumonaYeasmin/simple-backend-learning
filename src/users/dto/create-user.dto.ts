import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'নাম অবশ্যই স্ট্রিং (text) হতে হবে' })
  @IsNotEmpty({ message: 'নাম ফাঁকা রাখা যাবে না' })
  name: string;

  @IsEmail({}, { message: 'সঠিক ইমেইল এড্রেস দিতে হবে' })
  @IsNotEmpty({ message: 'ইমেইল ফাঁকা রাখা যাবে না' })
  email: string;

  
  @IsString()
  @IsNotEmpty({ message: 'পাসওয়ার্ড ফাঁকা রাখা যাবে না' })
  @MinLength(6, { message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' })
  password: string;
}
