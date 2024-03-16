import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from 'typeorm';

import { Booking } from './entities/booking.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class BookingService {
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>;

    @InjectEntityManager()
    private readonly entityManager: EntityManager;

    async initData() {
        const user1 = await this.entityManager.findOneBy(User, {
            id: 1
        });
        const user2 = await this.entityManager.findOneBy(User, {
            id: 2
        });

        const room1 = await this.entityManager.findOneBy(MeetingRoom, {
            id: 1
        });
        const room2 = await this.entityManager.findOneBy(MeetingRoom, {
            id: 4
        });

        const booking1 = new Booking();
        booking1.room = room1;
        booking1.user = user1;
        booking1.startTime = new Date();
        booking1.endTime = new Date(Date.now() + 1000 * 60 * 60);

        await this.entityManager.save(Booking, booking1);

        const booking2 = new Booking();
        booking2.room = room2;
        booking2.user = user2;
        booking2.startTime = new Date();
        booking2.endTime = new Date(Date.now() + 1000 * 60 * 60);

        await this.entityManager.save(Booking, booking2);

        const booking3 = new Booking();
        booking3.room = room1;
        booking3.user = user2;
        booking3.startTime = new Date();
        booking3.endTime = new Date(Date.now() + 1000 * 60 * 60);

        await this.entityManager.save(Booking, booking3);

        const booking4 = new Booking();
        booking4.room = room2;
        booking4.user = user1;
        booking4.startTime = new Date();
        booking4.endTime = new Date(Date.now() + 1000 * 60 * 60);

        await this.entityManager.save(Booking, booking4);
    }


    async find(
        pageNum: number,
        pageSize: number,
        username: string,
        meetingRoomName: string,
        meetingRoomPosition: string,
        bookingTimeRangeStart: string,
        bookingTimeRangeEnd: string
    ) {
        const skipCount = (pageNum - 1) * pageSize;

        const condition: Record<string, any> = {};

        if (username) condition.user = { username: Like(`%${username}%`) };
        if (meetingRoomName) condition.room = { name: Like(`%${meetingRoomName}%`) };
        if (meetingRoomPosition) condition.room = { position: Like(`%${meetingRoomPosition}%`) };
        if (bookingTimeRangeStart) {
            if (!bookingTimeRangeEnd) bookingTimeRangeEnd = bookingTimeRangeStart + 60 * 60 * 1000;
            condition.startTime = Between(new Date(bookingTimeRangeStart), new Date(bookingTimeRangeEnd));
        }

        const [bookings, totalCount] = await this.bookingRepository.findAndCount({
            select: {
                id: true,
                status: true,
                startTime: true,
                endTime: true,
                user: {
                    id: true,
                    nickName: true,
                    username: true,
                    email: true,
                    phoneNumber: true
                },
                room: {
                    id: true,
                    name: true,
                    capacity: true,
                    location: true,
                    equipment: true,
                    description: true,
                    isBooked: true,
                }
            },
            where: condition,
            relations: {
                user: true,
                room: true
            },
            skip: skipCount,
            take: pageSize
        });

        return {
            bookings,
            totalCount
        };
    }

    async add(createBookingDto: CreateBookingDto, userId: number) {
        const meetingRoom = await this.entityManager.findOneBy(MeetingRoom, {
            id: createBookingDto.meetingRoomId
        });

        if (!meetingRoom) throw new BadRequestException('会议室不存在');

        const user = await this.entityManager.findOneBy(User, { id: userId });

        const booking = new Booking();
        booking.room = meetingRoom;
        booking.user = user;
        booking.startTime = new Date(createBookingDto.startTime);
        booking.endTime = new Date(createBookingDto.endTime);

        const res = await this.bookingRepository.findOneBy({
            room: {
                id: createBookingDto.meetingRoomId,
            },
            startTime: LessThanOrEqual(new Date(createBookingDto.startTime)),
            endTime: MoreThanOrEqual(new Date(createBookingDto.endTime))
        });

        if (res) throw new BadRequestException('该时间段已被预定');

        try {
            await this.bookingRepository.save(booking);
            return '预定成功';
        } catch (error) {
            throw new BadRequestException('预定失败');
        }
    }


}
