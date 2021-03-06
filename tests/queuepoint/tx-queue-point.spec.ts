
//import logger = require('logging');
import createLogger from 'logging';
const logger = createLogger('TxQueuePoint-Test');

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';
import * as isUUID from 'validator/lib/isUUID';

import {Container, injectable} from "inversify";
import "reflect-metadata";
import * as uuid from 'uuid/v4';

import { TxTYPES } from "rx-txjs";
import { TxConnector } from "rx-txjs";
import { TxQueuePoint } from "rx-txjs";

@injectable()
export class TxConnectorRabbitMQ implements TxConnector {
  subscribeBC: (any) => void;

  id = uuid();
  constructor() {

  }
  listen(service: any, route: any) {
    console.log(`[TxConnectorRabbit::listen] ${service}-${route}-${this.id}`);
  }

  subscribe(cb: (any) => void) {
    this.subscribeBC = cb;
    console.log("[TxConnectorRabbit::subscribe] TxConnectorRabbit Method not implemented.");
  };

  next(service: string, route: string, data: any) {
    this.subscribeBC(data);
    console.log("[TxConnectorRabbit::next] TxConnectorRabbit Method not implemented.");
  }

  error(service: string, route: string, data: any) {
    this.subscribeBC(data);
    console.log("TxConnectorRabbit::error] TxConnectorRabbit Method not implemented.");
  }

  close() {
  }
}

describe('Queue Point Class', () => {

  it('tx-queue-point.spec: try inject TxConnectorRabbitMQ to TxQueuePoint', () => {
    logger.info('tx-queue-point.spec: try inject TxConnectorRabbitMQ to TxQueuePoint');
    let set = new Set<string>();

    const txContainer = new Container();

    // dependenies: bind component type (itself) and the connector type
    txContainer.bind<TxQueuePoint>(TxTYPES.TxQueuePoint).to(TxQueuePoint);
    txContainer.bind<TxConnector>(TxTYPES.TxConnector).to(TxConnectorRabbitMQ);

    // dependenies: before getting need to bind the component name.
    txContainer.bind<string | Symbol>(TxTYPES.TxPointName).toConstantValue('GITHUB::API::AUTH');
    const CP1 = txContainer.get<TxQueuePoint>(TxTYPES.TxQueuePoint);
    const CP2 = txContainer.get<TxQueuePoint>(TxTYPES.TxQueuePoint);

    CP1.queue().listen('CP1', 'tasks:connect');
    CP2.queue().listen('CP2', 'tasks:connect');

    set.add((<TxConnectorRabbitMQ>CP1.queue()).id);
    set.add((<TxConnectorRabbitMQ>CP2.queue()).id);

    // make sure they all different UUIDs.
    expect(set.size).to.equal(2);

    // make sure they all valid UUID
    assert(isUUID((<TxConnectorRabbitMQ>CP1.queue()).id));
    assert(isUUID((<TxConnectorRabbitMQ>CP2.queue()).id));
  });

  it('tx-queue-point.spec: binding TxConnectorRabbitMQ by variable', () => {
    logger.info('tx-queue-point.spec: binding TxConnectorRabbitMQ by variable')

    const txContainer = new Container();

    // bind TxConnectorRabbitMQ to TxTYPES.TxConnector as TxConnector
    txContainer.bind<TxQueuePoint>(TxTYPES.TxQueuePoint).to(TxQueuePoint);    
    txContainer.bind<TxConnector>(TxTYPES.TxConnector).to(TxConnectorRabbitMQ);

    // dependenies: before getting need to bind the component name.
    txContainer.bind<string | Symbol>(TxTYPES.TxPointName).toConstantValue('GITHUB::API::AUTH');
    const CP1 = txContainer.get<TxQueuePoint>(TxTYPES.TxQueuePoint);
    const CP2 = txContainer.get<TxQueuePoint>(TxTYPES.TxQueuePoint);

    CP1.queue().listen('CP1', 'tasks:connect');
    CP2.queue().listen('CP2', 'tasks:connect');

    let set = new Set<string>();
    set.add((<TxConnectorRabbitMQ>CP1.queue()).id);
    set.add((<TxConnectorRabbitMQ>CP2.queue()).id);

    // make sure they all different UUIDs.
    expect(set.size).to.equal(2);

    // make sure they all valid UUID
    assert(isUUID((<TxConnectorRabbitMQ>CP1.queue()).id));
    assert(isUUID((<TxConnectorRabbitMQ>CP2.queue()).id));
  });

});