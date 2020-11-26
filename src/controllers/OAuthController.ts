import axios, {AxiosError, AxiosResponse} from 'axios';
import env from '../env';
import User from '../entities/User';

axios.defaults.baseURL = env.CAS_API_HOST;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json'; // in-order to received json format from api

export class OAuthController {
    public async verifyToken(accessToken: string): Promise<User> {
        let response: AxiosResponse<User> = null;
        let error: AxiosError = null;
        await axios.get<User>('/api/users', {headers: {'Authorization': `Bearer ${accessToken}`}})
            .then(rs => response = rs)
            .catch(rs => error = rs);
        if (!!error){
            console.error("Verify token error: ", error);
            return null;
        } 
        return response.data;
    }

    //request verify token
    constructor() {

    }
}

export default new OAuthController();