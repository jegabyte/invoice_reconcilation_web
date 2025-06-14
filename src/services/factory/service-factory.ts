import { ApiDataService } from '../api.data.service';

export class ServiceFactory {
    static getDataService() {
        return ApiDataService;
    }
}