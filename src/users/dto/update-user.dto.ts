import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto.js';

/**
 * PartialType ব্যবহার করার সুবিধা:
 * ১. CreateUserDto-এর সব ভ্যালিডেশন রুলস (যেমন @IsString, @IsEmail) এখানেও কাজ করবে।
 * ২. তবে সব প্রোপার্টি ঐচ্ছিক (optional) হয়ে যাবে।
 * ৩. ইউজার চাইলে শুধু নাম, অথবা শুধু ইমেইল, অথবা দুটোই আপডেট করতে পারবে।
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
