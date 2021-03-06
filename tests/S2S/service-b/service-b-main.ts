import createLogger from 'logging';
const logger = createLogger('service-b:main');

import { TxMountPointRegistry, TxJobRegistry } from 'rx-txjs';
import { TxJobServicesComponent } from 'rx-txjs';

import { B3Component } from '../components/B3.component';
import { B2Component } from '../components/B2.component';
import { B1Component } from '../components/B1.component';

TxJobRegistry.instance.setServiceName('service-b');

new B1Component();
new B2Component();
new B3Component();

async function init() {
  logger.info('[service-b:init] start service-b init');

  await new TxJobServicesComponent().init();  

  let mp = TxMountPointRegistry.instance.get('JOB::SERVICES::MOUNTPOINT::COMPONENT');
  mp.reply().subscribe(
    (task) => {
      //logger.info("run: status of TxJobServicesComponent: " + data.head);
      logger.info("service-b: got data from TxJobServicesComponent: " + JSON.stringify(task, undefined, 2));
      
      // notify the caller (the tester) that job is completed
      process.send({service: 'service-b', status: 'completed', task: task});
    }
  )

  process.on('message', (msg) => {  
    logger.info('[service-b:init] message from parent:', msg);
    
    if (msg === 'service-b:exit') {
      logger.info('[service-b:exit] service-b going to exist')

      process.exit(0);
    }

  });
  
  // notify the caller (the tester) that main is ready for commands
  process.send('service-b:up')

  logger.info('[service-b:init] init completed');
}

// async function run() {
//   let mp = TxMountPointRegistry.instance.get('JOB::SERVICES::MOUNTPOINT::COMPONENT');
//   mp.reply().subscribe(
//     (task) => {
//       //logger.info("run: status of TxJobServicesComponent: " + data.head);
//       logger.info("service-b: got data from TxJobServicesComponent: " + JSON.stringify(task, undefined, 2));
      
//       // notify the caller (the tester) that job is completed
//       process.send({service: 'service-b', status: 'completed', task: task});
//     }
//   )
// }

init();


