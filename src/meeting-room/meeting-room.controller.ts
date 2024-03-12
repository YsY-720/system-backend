import { Controller, Get, Post, Body, Patch, Param, Delete, Query, DefaultValuePipe } from '@nestjs/common'
import { MeetingRoomService } from './meeting-room.service'
import { generateParseIntPipe } from 'src/utils'
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto'
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto'


@Controller('meeting-room')
export class MeetingRoomController {
    constructor(private readonly meetingRoomService: MeetingRoomService) { }

    //获取会议室列表
    @Get('list')
    async list(
        @Query('pageSize', new DefaultValuePipe(10), generateParseIntPipe('pageSize')) pageSize: number,
        @Query('pageNum', new DefaultValuePipe(1), generateParseIntPipe('pageNum')) pageNum: number,
        @Query('name') name: string,
        @Query('capacity') capacity: number,
        @Query('equipment') equipment: string
    ) {
        return await this.meetingRoomService.find(pageSize, pageNum, name, capacity, equipment)
    }

    //创建会议室
    @Post('create')
    async create(@Body() meetingRoomDto: CreateMeetingRoomDto) {
        return await this.meetingRoomService.create(meetingRoomDto)
    }

    //更新会议室信息
    @Post('update')
    async update(@Body() meetingRoomDto: UpdateMeetingRoomDto) {
        return await this.meetingRoomService.update(meetingRoomDto)
    }

    //查询会议室
    @Get(':id')
    async find(@Param('id') id: number) {
        return await this.meetingRoomService.findOne(id)
    }

    //删除会议室
    @Delete(':id')
    async delete(@Param('id') id: number) {
        return await this.meetingRoomService.delete(id)
    }
}
