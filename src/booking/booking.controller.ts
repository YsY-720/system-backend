import { Controller, Get, Post, Body, Patch, Param, Delete, Query, DefaultValuePipe } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { generateParseIntPipe } from 'src/utils';
import { UserInfo } from 'src/custom.decorator';

interface QueryList {
    pageNum: number;
    pageSize: number;
    username?: string;
    meetingRoomName?: string;
    meetingRoomPosition?: string;
    startTime?: string;
    endTime?: string;
}

@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService) { }

    //会议室预定列表
    @Post('list')
    async list(@Body() queryList: QueryList,) {
        const { pageNum, pageSize, username, meetingRoomName, meetingRoomPosition, startTime, endTime } = queryList;
        return await this.bookingService.find(pageNum, pageSize, username, meetingRoomName, meetingRoomPosition, startTime, endTime);
    }

    //新增预定
    @Post('add')
    async add(@Body() createBookingDto: CreateBookingDto, @UserInfo('userId') userId: number) {
        return await this.bookingService.add(createBookingDto, userId);
    }

    //审批通过
    @Get('apply/:id')
    async apply(@Param('id') id: number) {
        return await this.bookingService.apply(id);
    }

    //审批驳回
    @Get('reject/:id')
    async reject(@Param('id') id: number) {
        return await this.bookingService.reject(id);
    }

    //解除申请
    @Get('unbind/:id')
    async unbind(@Param('id') id: number) {
        return await this.bookingService.unbind(id);
    }


    @Get('urge/:id')
    async urge(@Param('id') id: number) {
        return await this.bookingService.urge(id);
    }
}
