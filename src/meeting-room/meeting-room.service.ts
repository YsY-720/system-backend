import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MeetingRoom } from './entities/meeting-room.entity'
import { Like, Repository } from 'typeorm'
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto'
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto'


@Injectable()
export class MeetingRoomService {
    logger: Logger
    constructor() {
        this.logger = new Logger()
    }

    @InjectRepository(MeetingRoom)
    private readonly meetingRoomRepository: Repository<MeetingRoom>

    initData() {
        const room1 = new MeetingRoom()
        room1.name = '木星'
        room1.capacity = 10
        room1.equipment = '白板'
        room1.location = '一层西'

        const room2 = new MeetingRoom()
        room2.name = '金星'
        room2.capacity = 5
        room2.equipment = ''
        room2.location = '二层东'

        const room3 = new MeetingRoom()
        room3.name = '天王星'
        room3.capacity = 30
        room3.equipment = '白板，电视'
        room3.location = '三层东'

        this.meetingRoomRepository.insert([room1, room2, room3])
    }

    async find(pageSize: number, pageNum: number, name?: string, capacity?: number, equipment?: string, location?: string) {
        const skipCont = (pageNum - 1) * pageSize

        const condition: Record<string, any> = {}
        if (name) condition.name = Like(`%${name}%`)
        if (capacity) condition.capacity = capacity
        if (equipment) condition.equipment = Like(`%${equipment}%`)
        if (location) condition.location = Like(`%${location}%`)

        const [meetingRooms, totalCount] = await this.meetingRoomRepository.findAndCount({
            skip: skipCont,
            take: pageSize,
            where: condition
        })
        return { meetingRooms, totalCount }
    }

    async create(meetingRoomDto: CreateMeetingRoomDto) {
        const room = await this.meetingRoomRepository.findOneBy({ name: meetingRoomDto.name })

        if (room) throw new BadRequestException('会议室已存在')

        return await this.meetingRoomRepository.insert(meetingRoomDto)
    }

    async update(meetingRoomDto: UpdateMeetingRoomDto) {
        const room = await this.meetingRoomRepository.findOneBy({ id: meetingRoomDto.id })

        if (!room) throw new BadRequestException('会议室不存在')

        room.name = meetingRoomDto.name
        room.capacity = meetingRoomDto.capacity
        room.location = meetingRoomDto.location

        if (meetingRoomDto.description) room.description = meetingRoomDto.description
        if (meetingRoomDto.equipment) room.equipment = meetingRoomDto.equipment


        await this.meetingRoomRepository.update({ id: meetingRoomDto.id }, room)
        return '信息更新成功'
    }

    async findOne(id: number) {
        return await this.meetingRoomRepository.findOneBy({ id: id })
    }

    async delete(id: number) {
        try {
            await this.meetingRoomRepository.delete({ id: id })
            return '删除成功'
        } catch (e) {
            this.logger.error(MeetingRoomService, e)
            throw new BadRequestException('删除失败')
        }
    }
}
