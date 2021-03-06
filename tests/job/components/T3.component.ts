import createLogger from 'logging'; 
const logger = createLogger('T3');

import { TxSinglePointRegistry } from 'rx-txjs';
import { TxTask } from 'rx-txjs';

export class T3Component {
  singlepoint = TxSinglePointRegistry.instance.create('GITHUB::T3');

  method = '';
  reply: any;

  constructor() {
    this.singlepoint.tasks().subscribe(
      (task) => {
        logger.info('[T3Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));          
        this.method = task['method'];

        // just send the reply to whom is 'setting' on this reply subject
        task.reply().next(new TxTask({method: 'from T3', status: 'ok'}, task['data']))
      },
      (error) => {
        logger.info('[T3Component:error] got error = ' + JSON.stringify(error.get(), undefined, 2));
        this.method = error['method'];

        // just send the reply to whom is 'setting' on this reply subject
        error.reply().error(new TxTask({method: 'from T3', status: 'ERROR'}, error['data']))
      }
    );

    this.singlepoint.undos().subscribe(
      (task) => {
          logger.info('[T3Component:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));
          this.method = task['method'];

          // just send the reply to whom is 'setting' on this reply subject
          task.reply().next(new TxTask({method: 'undo from T3', status: 'ok'}, task['data']))
      }
    );

  }

}  