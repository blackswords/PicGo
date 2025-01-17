import {IFilter, IGetResult, IObject, IResult} from '@picgo/store/dist/types'
import {ipcRenderer, IpcRendererEvent} from 'electron'
import {uuid} from 'uuidv4'
import {
    PICGO_GET_BY_ID_DB,
    PICGO_GET_DB,
    PICGO_INSERT_DB,
    PICGO_INSERT_MANY_DB,
    PICGO_REMOVE_BY_ID_DB,
    PICGO_UPDATE_BY_ID_DB
} from '#/events/constants'
import {IGalleryDB} from '#/types/extra-vue'

export class GalleryDB implements IGalleryDB {
    async get<T> (filter?: IFilter): Promise<IGetResult<T>> {
        return await this.msgHandler<IGetResult<T>>(PICGO_GET_DB, filter)
    }

    async insert<T> (value: T): Promise<IResult<T>> {
        return await this.msgHandler<IResult<T>>(PICGO_INSERT_DB, value)
    }

    async insertMany<T> (value: T[]): Promise<IResult<T>[]> {
        return await this.msgHandler<IResult<T>[]>(PICGO_INSERT_MANY_DB, value)
    }

    async updateById (id: string, value: IObject): Promise<boolean> {
        return await this.msgHandler<boolean>(PICGO_UPDATE_BY_ID_DB, id, value)
    }

    async getById<T> (id: string): Promise<IResult<T> | undefined> {
        return await this.msgHandler<IResult<T> | undefined>(PICGO_GET_BY_ID_DB, id)
    }

    async removeById (id: string): Promise<void> {
        return await this.msgHandler<void>(PICGO_REMOVE_BY_ID_DB, id)
    }

    private msgHandler<T> (method: string, ...args: any[]): Promise<T> {
        return new Promise((resolve) => {
            const callbackId = uuid()
            const callback = (event: IpcRendererEvent, data: T, returnCallbackId: string) => {
                if (returnCallbackId === callbackId) {
                    resolve(data)
                    ipcRenderer.removeListener(method, callback)
                }
            }
            ipcRenderer.on(method, callback)
            ipcRenderer.send(method, ...args, callbackId)
        })
    }
}

export default new GalleryDB()
