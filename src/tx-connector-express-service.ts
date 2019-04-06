import createLogger from 'logging'; 
const logger = createLogger('TxConnectorExpressService');

import * as express from 'express';
//import * as request from 'request-promise';

import { TxCallback } from 'rx-txjs';
import { TxSubscribe } from 'rx-txjs';
import { TxTask } from 'rx-txjs';
import { TxConnectorConnection } from 'rx-txjs';
import { TxConnectorExpressListener } from './tx-connector-express-listener';

export class TxConnectorExpressService {

  private connection = new TxConnectorConnection();
  private callbacks = new TxSubscribe<this>();  
  private defined = false;

  constructor(private listener: TxConnectorExpressListener, service: string, path: string) { 
    this.connection.parse(service, path);
  }

  public add(): express.Router {

    // route: /http --------------------------------------------------------------
    const router = express.Router();

    router.get('/', (req, res) => {      
      logger.info('[/TxConnectorExpressService:GET] data received was: ' + JSON.stringify(req.body));

      // set the appropriate HTTP header
      res.setHeader('Content-Type', 'application/json');
      res.json({status: 'ok'});
    });
    
    router.post('/', (req, res) => {
      logger.info('[/TxConnectorExpressService:POST] data received was: ' + JSON.stringify(req.body));

      //this.callbacks.dataCB(new TxTask<any>(req.body.head, req.body.data));
      this.callbacks.next(new TxTask<any>(req.body.head, req.body.data), this);

      // set the appropriate HTTP header
      res.setHeader('Content-Type', 'application/json');      
      res.json({status: '200'});
    });

    router.put('/:id', (req, res) => {
      console.log('angular: PUT id = ' + req.params.id);
      console.log('angular: PUT data received was: ' + JSON.stringify(req.body));

      // set the appropriate HTTP header
      res.setHeader('Content-Type', 'application/json');

      res.json(req.body);
    });

    router.delete('/:id', (req, res) => {
      console.log('angular: DELETE id = ' + req.params.id);      
      console.log('angular: DELETE data received was: ' + JSON.stringify(req.body));
                    
      // set the appropriate HTTP header
      res.setHeader('Content-Type', 'application/json');      
      res.json(req.body);
    });

    return router;
  // --------------------------------------------------------------------------
  }
    
  subscribe(dataCB: TxCallback<any>, errorCB?: TxCallback<any>, completeCB?: TxCallback<any>) {
    this.callbacks.subscribe(dataCB, errorCB, completeCB);    
    this.defined = true;
  }

  error(service: string, route: string, data: any) {
    console.log("[TxConnectorExpress::error] TxConnectorExpress Method not implemented.");
  }

  close() {
    this.callbacks.unsubscribe(0);
  }

  getService() {
    return this.connection.getService();
  }

  getPath() {
    return this.connection.path;
  }

  isDefined() {
    return this.defined;
  }
}

 
