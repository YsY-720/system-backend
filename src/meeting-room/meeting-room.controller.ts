import { Controller, Get, Post, Body, Patch, Param, Delete, Query, DefaultValuePipe, HttpStatus } from '@nestjs/common'
import { ApiParam, ApiBody, ApiTags, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { MeetingRoomService } from './meeting-room.service'
import { generateParseIntPipe } from 'src/utils'
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto'
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto'
import { RequireLogin } from 'src/custom.decorator'
import { MeetingRoomVo } from './vo/meeting-room.vo'
import { MeetingRoomListVo } from './vo/meeting-room-list.vo'

@ApiTags('会议室管理模块')
@Controller('meeting-room')
export class MeetingRoomController {
    constructor(private readonly meetingRoomService: MeetingRoomService) { }

    //获取会议室列表
    @ApiBearerAuth()
    @ApiQuery({
        name: 'pageNo',
        type: Number,
        required: false
    })
    @ApiQuery({
        name: 'pageSize',
        type: Number,
        required: false
    })
    @ApiQuery({
        name: 'name',
        type: String,
        required: false
    })
    @ApiQuery({
        name: 'capacity',
        type: String,
        required: false
    })
    @ApiQuery({
        name: 'equipment',
        type: String,
        required: false
    })
    @ApiResponse({
        type: MeetingRoomListVo
    })
    @Get('list')
    async list(
        @Query('pageSize', new DefaultValuePipe(10), generateParseIntPipe('pageSize')) pageSize: number,
        @Query('pageNum', new DefaultValuePipe(1), generateParseIntPipe('pageNum')) pageNum: number,
        @Query('name') name: string,
        @Query('capacity') capacity: number,
        @Query('equipment') equipment: string,
        @Query('location') location: string
    ) {
        return await this.meetingRoomService.find(pageSize, pageNum, name, capacity, equipment, location)
    }

    //创建会议室
    @ApiBearerAuth()
    @ApiBody({
        type: CreateMeetingRoomDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: '会议室已存在'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'success',
        type: MeetingRoomVo
    })
    @RequireLogin()
    @Post('create')
    async create(@Body() meetingRoomDto: CreateMeetingRoomDto) {
        return await this.meetingRoomService.create(meetingRoomDto)
    }

    //更新会议室信息
    @ApiBearerAuth()
    @ApiBody({
        type: UpdateMeetingRoomDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: '会议室不存在',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '信息更新成功',
    })
    @RequireLogin()
    @Post('update')
    async update(@Body() meetingRoomDto: UpdateMeetingRoomDto) {
        return await this.meetingRoomService.update(meetingRoomDto)
    }

    //查询会议室
    @ApiBearerAuth()
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'id'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'success',
        type: MeetingRoomVo
    })
    @RequireLogin()
    @Get(':id')
    async find(@Param('id') id: number) {
        return await this.meetingRoomService.findOne(id)
    }

    //删除会议室
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'id'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: '删除成功'
    })
    @RequireLogin()
    @Delete(':id')
    async delete(@Param('id') id: number) {
        return await this.meetingRoomService.delete(id)
    }
}
