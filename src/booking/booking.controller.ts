import { Controller, Get, Post, Body, Patch, Param, Delete, Query, DefaultValuePipe } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { generateParseIntPipe } from 'src/utils';
import { UserInfo } from 'src/custom.decorator';

@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService) { }

    //会议室预定列表
    @Get('list')
    async list(
        @Query('pageNum', new DefaultValuePipe(1), generateParseIntPipe('pageNum')) pageNum: number,
        @Query('pageSize', new DefaultValuePipe(10), generateParseIntPipe('pageSize')) pageSize: number,
        @Query('username') username: string,
        @Query('meetingRoomName') meetingRoomName: string,
        @Query('meetingRoomPosition') meetingRoomPosition: string,
        @Query('bookingTimeRangeStart') bookingTimeRangeStart: string,
        @Query('bookingTimeRangeEnd') bookingTimeRangeEnd: string,
    ) {
        return await this.bookingService.find(pageNum, pageSize, username, meetingRoomName, meetingRoomPosition, bookingTimeRangeStart, bookingTimeRangeEnd);
    }

    @Post('add')
    async add(@Body() createBookingDto: CreateBookingDto, @UserInfo('userId') userId: number) {
        return await this.bookingService.add(createBookingDto, userId);
    }
}
