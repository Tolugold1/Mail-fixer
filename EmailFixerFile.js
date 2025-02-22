const levenshtein = require('fast-levenshtein');

class EmailDomainFixer {
  constructor(validDomains = []) {
    this.validDomains = validDomains.length
      ? validDomains
      : ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
  }

  correctEmail(email) {
    const [localPart, domain] = email.split("@");
    if (!domain) return email; // Invalid email, return as is

    const closestDomain = this.validDomains.reduce((best, current) => {
      const distance = levenshtein.get(domain, current);
      return distance < best.distance ? { domain: current, distance } : best;
    }, { domain: domain, distance: Infinity });

    return closestDomain.distance <= 2 ? `${localPart}@${closestDomain.domain}` : email;
  }

  correctEmails(emailList) {
    return emailList.map(email => this.correctEmail(email));
  }
}

module.exports = EmailDomainFixer;
