const fs = require('fs');
const file = 'c:/Users/Admin/Desktop/NEXT LEVEL 30.10.25/Assignment/solution05/ecospark-client/src/components/navbar1.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(`                  )}
                </div>
              </nav>
              {/* Logo */}
              <a href={logo.url} className="flex items-center gap-2">`, `                  )}
            </div>
          </nav>

          {/* Mobile Menu */}
          <div className="block lg:hidden">
            <div className="max-w-6xl mx-auto flex items-center justify-between rounded-2xl border border-emerald-100/80 dark:border-emerald-900/70 bg-white/90 dark:bg-emerald-950/80 backdrop-blur px-4 py-3 shadow-sm">
              {/* Logo */}
              <a href={logo.url} className="flex items-center gap-2">`);

fs.writeFileSync(file, txt);
