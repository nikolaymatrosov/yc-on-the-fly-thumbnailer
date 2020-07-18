import {handler} from "../src";
import * as chai from "chai";


it('should work with ?path=200x200/foo.png', async function () {
    const res = await handler({
        httpMethod: 'GET',
        queryStringParameters: {
            path: '200x200/foo.png'
        }
    });
    chai.expect(res.statusCode == 200)
});
