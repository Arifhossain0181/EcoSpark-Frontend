const fs = require('fs');
const file = 'c:/Users/Admin/Desktop/NEXT LEVEL 30.10.25/Assignment/solution05/ecospark-client/src/components/navbar1.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(`                </SheetContent>
              </Sheet>
            </div>
          </div>

const renderMenuItem = (item: MenuItem) => {`, `                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </section>
    );
  };

const renderMenuItem = (item: MenuItem) => {`);

fs.writeFileSync(file, txt);
