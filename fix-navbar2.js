const fs = require('fs');
const file = 'c:/Users/Admin/Desktop/NEXT LEVEL 30.10.25/Assignment/solution05/ecospark-client/src/components/navbar1.tsx';
let txt = fs.readFileSync(file, 'utf8');

const regex = /<\/Sheet>\s*<\/div>\s*<\/div>\s*const renderMenuItem/s;
const replacement = `              </Sheet>
            </div>
          </div>
        </div>
      </section>
    );
  };

const renderMenuItem`;

if (regex.test(txt)) {
  txt = txt.replace(regex, replacement);
  fs.writeFileSync(file, txt);
  console.log("Success");
} else {
  console.log("Regex did not match");
}
