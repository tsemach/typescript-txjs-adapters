## RX-TXJS Adapters Package 

This package include a collection of adapters use by rx-txjs. RX-TXJS is a generic library not bound to a specfic implementation of queue, parsistance and so on.
RX-TXJS is a library able to run you business logic as components (a class with "*mountpoint*") and job. However of a job need to save itself to continue running later on it need some persistance API but RX-TXJS is not force a specific persistance device instead it define an interface and the user needs to provide a class which implement this interface for a specfic persistance device. Some goes for other interface like queue, express, distribute and so on.

However you can implement those interfaces yourself or use on of those implements provide by rx-txjs-adapters. 

* **`tx-connector-express`** - enable component to component direct communication using express. You can same mountpoint interface as use locally in the service between services using javascript express package. This package also use when running rx-txjs jobs acros services. 
*  **`tx-connector-rabbitmq`** - enable component to component direct communication using rabbitmq queue. You can same mountpoint interface as use locally in the service between services using javascript rabbitmq package. This package also use when running rx-txjs jobs acros services.
*  **`tx-distribute-bull`** - job is set of components running one after the other. You can turn on the "publish: distribute" flag to run each component in a distribute manner. *tx-distribute-bull* class enable to run those component by send them first fo Bull queue then pull them by any other (or this) instance listen to that queue and continue to from the some place. 
*  * **`tx-record-persis-mongodb`** - During job execution data pass between components can be record for auditing. This class enable to to store them using mongodb.

### EXamples

* Using **`TxConnectorExpress`**

On receiving service
```typescript
import { TxRoutePoint, TxTask } from 'rx-txjs';
import { TxRoutePointRegistry } from 'rx-txjs';

export class R1Component {
  private routepoint: TxRoutePoint;
  
  constructor() {
    this.routepoint = TxRoutePointRegistry.instance.create('GITHUB::R1')    
    
    // use TxConnectorExpress to listen on localhost:3001/test1
    this.routepoint.listen('localhost:3001', '/test1').subscribe(

      (task: TxTask<any>) => {
        // when a "message" is arraived call this callback 
        logger.info('[subscribe] got data from service: task = ' + JSON.stringify(task.get(), undefined, 2))        

        let host = 'localhost:'+task.head.port
        let path = task.head.path

        console.log(`R1Component:subscribe going to send to ${host} path ${path}`)

        // return reply to the caller
        this.routepoint.next(host, path, new TxTask<any>({from: 'localhost:3001:/test2'}, 'this is the data send from remote server R1 to localhost'))

        // close the listen point
        this.routepoint.close()
      }
    )
  }
}
````

On the sending service
````typesdcript
import { TxTask } from 'rx-txjs';
import { TxConnectorExpress } from "rx-txjs-adapters";

async function main() {
  let express = new TxConnectorExpress();
  
  let service = await express.listen('localhost:3000', '/test');

  service.subscribe(
    (task) => {
      logger.info('[subscribe] got data from express connector: task = ' + JSON.stringify(task, undefined, 2))

      express.close('localhost:3000', '/test')
    });    
          
  express.next('localhost:3000', 'test', new TxTask<any>({from: 'test'}, {data: 'this is the data'}))
}

main();
````