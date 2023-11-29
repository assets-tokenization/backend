const fs = require('fs');
const _ = require('lodash');
const axios = require('axios');
const schedule = require('node-schedule');

class UpdateHandler {
  constructor(config = {}, afterUpdateHandler = () => null) {
    this.config = config;
    this.afterUpdateHandler = afterUpdateHandler;

    this.initSchedule();
  }

  /**
   * Init update schedule.
   * @returns {void}
   * @memberof Iit
   */
  initSchedule() {
    const { updateSchedule } = this.config;
    if (updateSchedule) {
      schedule.scheduleJob(updateSchedule, this.updateCertificates.bind(this));
      this.updateCertificates();
    }
  }

  /**
   * Update certificates.
   * @returns {void}
   */
  async updateCertificates() {
    const { casOrigin, caCertsOrigin, casPath, caCertsPath, casFrontPath, caCertsFrontPath } = config.iit;

    if (!casOrigin || !caCertsOrigin) {
      log.save('update-certificates-error', 'casOrigin or caCertsOrigin not set.');
      return;
    }

    try {
      const result = await Promise.all([{
        path: casPath,
        origin: casOrigin,
        front: casFrontPath
      }, {
        path: caCertsPath,
        origin: caCertsOrigin,
        front: caCertsFrontPath
      }].map(async ({ path, origin, front }) => {
        const file = await axios.get(origin, {
          responseType: 'arraybuffer'
        });

        if (front) {
          await fs.writeFileSync(front, file.data);
        }

        await fs.writeFileSync(path, file.data);
        return true
      }));

      if (!result.filter(Boolean).length) {
        return;
      }

      log.save('update-certificates-success');
      this.afterUpdateHandler();
    } catch (error) {
      log.save('update-certificates-error', error.message);
    }
  }
}

module.exports = UpdateHandler;
