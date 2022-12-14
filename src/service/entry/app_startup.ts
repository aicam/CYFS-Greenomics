import * as cyfs from 'cyfs-sdk';
import { DEC_ID, APP_NAME } from '@src/common/constant';
import { postRouterHandleObject, RouterArray } from '../types';
import { routers } from '../routers';
import { checkStack, waitStackOOD } from '@src/common/cyfs_helper/stack_wraper';

class PostRouterReqPathRouterHandler implements cyfs.RouterHandlerPostObjectRoutine {
    protected m_routerObj: postRouterHandleObject;
    public constructor(routerObj: postRouterHandleObject) {
        this.m_routerObj = routerObj;
    }

    public call(
        param: cyfs.RouterHandlerPostObjectRequest
    ): Promise<cyfs.BuckyResult<cyfs.RouterHandlerPostObjectResult>> {
        const reqPath = param.request.common.req_path;
        if (reqPath === this.m_routerObj.reqPath) {
            return this.m_routerObj.router(param);
        } else {
            return Promise.resolve(
                cyfs.Ok({
                    action: cyfs.RouterHandlerAction.Pass
                })
            );
        }
    }
}

async function addRouters(stack: cyfs.SharedCyfsStack, routers: RouterArray): Promise<void> {
    for (const routerObj of routers) {
        // Set access permissions for req_path
        const access = new cyfs.AccessString(0);
        access.set_group_permissions(cyfs.AccessGroup.OwnerDec, cyfs.AccessPermissions.Full);
        // if (routerObj.reqPath.endsWith('/messages/retrieve')) {
        //     access.set_group_permissions(
        //         cyfs.AccessGroup.FriendZone,
        //         cyfs.AccessPermissions.CallOnly
        //     );
        // }
        const ra = await stack
            .root_state_meta_stub()
            .add_access(cyfs.GlobalStatePathAccessItem.new(routerObj.reqPath, access));
        if (ra.err) {
            console.error(`path (${routerObj.reqPath}) add access error: ${ra}`);
            continue;
        }
        console.log('add access successed: ', ra.unwrap());

        // Mount the routing module to the specified req_path
        const handleId = `post-${routerObj.reqPath}`;
        const r = await stack
            .router_handlers()
            .add_post_object_handler(
                cyfs.RouterHandlerChain.Handler,
                handleId,
                1,
                undefined,
                routerObj.reqPath,
                cyfs.RouterHandlerAction.Pass,
                new PostRouterReqPathRouterHandler(routerObj)
            );

        if (r.err) {
            console.error(`add post handler (${handleId}) failed, err: ${r}`);
        } else {
            console.info(`add post handler (${handleId}) success.`);
        }
    }
    // const access = new cyfs.AccessString(0);
    // access.set_group_permissions(cyfs.AccessGroup.FriendZone, cyfs.AccessPermissions.ReadOnly);
    // access.set_group_permissions(cyfs.AccessGroup.CurrentDevice, cyfs.AccessPermissions.ReadOnly);
    // access.set_group_permissions(cyfs.AccessGroup.OwnerDec, cyfs.AccessPermissions.ReadOnly);
    // const r = await stack
    //     .root_state_meta_stub()
    //     .add_access(cyfs.GlobalStatePathAccessItem.new('/messages_list', access));
    // if (r.err) {
    //     console.error(`path /messages_list add access error: ${r}`);
    // } else {
    //     console.log('add sccess /messages_list success.');
    // }
    // console.log('access unmber:', access.value);
}

async function main() {
    // logging
    cyfs.clog.enable_file_log({
        name: APP_NAME,
        dir: cyfs.get_app_log_dir(APP_NAME)
    });

    // waiting to go online
    const waitR = await waitStackOOD(DEC_ID);
    if (waitR.err) {
        console.error(`service start failed when wait stack online, err: ${waitR}.`);
        return;
    }

    // register route
    const stack = checkStack().check();
    addRouters(stack, routers);
    console.log('service is ready.');
}

main();
