// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) 2024 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';

import AnnotationPageComponent from 'components/annotation-page/annotation-page';
import {
    getJobAsync, saveLogsAsync, changeFrameAsync,
    closeJob as closeJobAction,
} from 'actions/annotation-actions';

import { CombinedState, Workspace } from 'reducers';

type OwnProps = RouteComponentProps<{
    tid: string;
    jid: string;
}>;

interface StateToProps {
    job: any | null | undefined;
    frameNumber: number;
    fetching: boolean;
    workspace: Workspace;
}

interface DispatchToProps {
    getJob(): void;
    changeFrame(frame: number): void;
    saveLogs(): void;
    closeJob(): void;
}

function mapStateToProps(state: CombinedState, own: OwnProps): StateToProps {
    const { params } = own.match;
    const jobID = +params.jid;
    const {
        annotation: {
            job: { requestedId, instance: job, fetching },
            workspace,
            player: {
                frame: {
                    number: frameNumber,
                },
            },
        },
    } = state;

    return {
        job: jobID === requestedId || (Number.isNaN(jobID) && Number.isNaN(requestedId)) ? job : null,
        fetching,
        workspace,
        frameNumber,
    };
}

function mapDispatchToProps(dispatch: any, own: OwnProps): DispatchToProps {
    const { params } = own.match;
    const taskID = +params.tid;
    const jobID = +params.jid;
    const searchParams = new URLSearchParams(window.location.search);
    const initialFilters: object[] = [];
    const initialOpenGuide = searchParams.has('openGuide');
    const parsedFrame = +(searchParams.get('frame') || 'NaN');
    const initialFrame = Number.isInteger(parsedFrame) && parsedFrame >= 0 ? parsedFrame : null;

    if (searchParams.has('serverID') && searchParams.has('type')) {
        const serverID = searchParams.get('serverID');
        const type = searchParams.get('type');
        if (serverID && !Number.isNaN(+serverID)) {
            initialFilters.push({
                and: [{ '==': [{ var: 'serverID' }, serverID] }, { '==': [{ var: 'type' }, type] }],
            });
        }
    }

    if (searchParams.size) {
        own.history.replace(own.history.location.pathname);
    }

    return {
        getJob(): void {
            dispatch(getJobAsync({
                taskID,
                jobID,
                initialFrame,
                initialFilters,
                initialOpenGuide,
            }));
        },
        saveLogs(): void {
            dispatch(saveLogsAsync());
        },
        closeJob(): void {
            dispatch(closeJobAction());
        },
        changeFrame(frame: number): void {
            dispatch(changeFrameAsync(frame));
        },
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AnnotationPageComponent));
